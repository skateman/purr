'use strict';

const showError = (msg) => {
  document.querySelector('.error > .errmsg').textContent = msg;
  showInfo('error');
};

const showInfo = (klass) => {
  if (['init', 'work', 'error'].includes(klass)) {
    document.querySelector(`.info-messages > :not(.hidden)`).classList.add('hidden');
    document.querySelector(`.info-messages .${klass}`).classList.remove('hidden');
  }
};

const copyToClipboard = (e) => {
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = e.target.textContent;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
};

const sendHttpRequest = (sock) => {
  // Build up the HTTP request headers
  const upgrade = document.querySelector('#websocket').value;

  const req = `
    GET ${window.request.path} HTTP/1.1                  \r
    Host: ${window.request.host}                         \r
    Upgrade: ${upgrade}                                  \r
    Purr-Request: MEOW                                   \r
    Purr-Version: ${chrome.runtime.getManifest().version}\r
    Connection: Upgrade                                  \r
    User-Agent: ${navigator.userAgent}                   \r
  `.replace(/( {2,})|(^\n)/g, '').replace(/\r\n$/, '\r\n\r\n');

  let buffer = new ArrayBuffer(req.length);
  let writer = new Uint8Array(buffer);
  // Convert it to the appropriate format
  for (let i=0, len=req.length; i<len; i++) {
    writer[i] = req.charCodeAt(i);
  }

  // Send it out
  chrome.sockets.tcp.send(sock, buffer, () => null);
};

const windowLoaded = () => new Promise((resolve, reject) =>
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('span.version').textContent = chrome.runtime.getManifest().version;
    resolve();
  })
);

const parseBackgroundURL = () => new Promise((resolve, reject) =>
  chrome.runtime.getBackgroundPage((background) => {
    if (background.url) {
      var url = new URL(decodeURIComponent(background.url.replace(/^https?:\/\/purr\// ,'')));
      var m = url.protocol.match(/^http(s?):$/);

      if (m) {
        window.request = {
          hostname: url.hostname,
          host: url.host,
          port: url.port ? parseInt(url.port) : (m[1] ? 443 : 80),
          path: url.pathname,
          secure: !!m[1]
        };
        resolve();
      } else {
        reject('Invalid URL!');
      }
    } else {
      reject('This application cannot be started separately!');
    }
  })
);

const createServer = () => new Promise((resolve, reject) =>
  chrome.sockets.tcpServer.create({}, (server) =>
    chrome.sockets.tcpServer.listen(server.socketId, '127.0.0.1', 8888, 0, (result) =>
      chrome.sockets.tcpServer.getInfo(server.socketId, (info) => {
        if (result < 0) {
          reject(`tcpServer.listen returned with ${result}`);
        } else {
          document.querySelector('.address').textContent = `127.0.0.1:${info.localPort}`;
          document.querySelector('.address').onclick = copyToClipboard;
          showInfo('work');
          resolve(server.socketId);
        }
      })
    )
  )
);

const setListeners = (promise) => {
  // Set up the proxying
  chrome.sockets.tcp.onReceive.addListener((recv) => {
    let node = window.pairing[recv.socketId];
    if (node.purr) { // Synchronize
      // Convert the response to a readable format
      let response = String.fromCharCode.apply(null, new Uint8Array(recv.data));

      if (response.match(/^HTTP\/1\.1 101 Switching Protocols/)) {
        // If the upgrade was successful, unpause the socket
        chrome.sockets.tcp.setPaused(node.pair, false, () =>
          delete node.purr
        );
      } else {
        // The upgrade was not successful, close the connection
        console.error('Error happened during HTTP upgrade...')
        cleanupClient(recv.socketId);
      }

    } else { // Transmit normally
      chrome.sockets.tcp.send(node.pair, recv.data, () => null);
    }
  });

  // Error handling for client connections
  chrome.sockets.tcp.onReceiveError.addListener((err) =>
    cleanupClient(err.socketId)
  );

 // Keeping up the promise-chain
  return promise;
};

const createClient = (peer) => new Promise((resolve, reject) =>
  chrome.sockets.tcp.create({}, (client) =>
    chrome.sockets.tcp.connect(client.socketId, window.request.hostname, window.request.port, (result) => {
      if (result < 0) {
        reject(`tcp.connect returned with ${result}`);
      } else {
        // Set up socket pairing information
        window.pairing[peer] = { pair: client.socketId };
        window.pairing[client.socketId] = { pair: peer, purr: true };
        updateClients();
        resolve(client.socketId);
      }
    })
  )
);

const cleanupClient = (sock) => {
  let node = window.pairing[sock];
  if (node) { // Do not close them twice
    delete window.pairing[sock];
    delete window.pairing[node.pair];

    updateClients();

    chrome.sockets.tcp.close(sock);
    chrome.sockets.tcp.close(node.pair);
  }
};

const acceptServer = (server) => {
  chrome.sockets.tcpServer.onAccept.addListener((client) => {
    createClient(client.clientSocketId).then(sendHttpRequest, showError);
    return server;
  })
};

const updateClients = () => {
  document.querySelector('.clients').textContent = parseInt(Object.keys(pairing).length / 2);
};

window.pairing = {};

windowLoaded()
.then(parseBackgroundURL)
.then(createServer)
.then(setListeners)
.then(acceptServer)
.catch(showError);
