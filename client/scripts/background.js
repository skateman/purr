'use strict';

chrome.app.runtime.onLaunched.addListener((data) => {
  // Pass the url for further processing
  window.url = data.url;
  // Create the application window
  chrome.app.window.create('index.html', {
    innerBounds: {
      width: 400,
      height: 160
    }
  }, (win) =>
    // Clean up all sockets if the app window gets closed
    win.onClosed.addListener(() =>
      ['tcp', 'tcpServer'].forEach((provider) =>
        chrome.sockets[provider].getSockets((sockets) =>
          sockets.forEach((socket) => {
            chrome.sockets[provider].disconnect(socket.socketId);
            chrome.sockets[provider].close(socket.socketId);
          })
        )
      )
    )
  );
});

