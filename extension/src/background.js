'use strict';

const nativeApp = () => {
  // Connect to the native app if not already connected
  if (window._app === undefined) {
    window._app = chrome.runtime.connectNative('purr');
    window._app.clients = 0;
    // Clean up if the app gets disconnected
    window._app.onDisconnect.addListener(() => delete(window._app));
  }
  return window._app;
};

// Set up proxying between the content script and the native app
chrome.runtime.onConnect.addListener((left) => {
  const right = nativeApp();
  const tabid = left.sender.tab.id;
  right.clients++;

  // Acticate the extension's icon
  chrome.pageAction.show(tabid);

  // CONTENT SCRIPT -> NATIVE APP
  left.onMessage.addListener((msg) => {
    // Append the tab id as source to the message
    msg.src = tabid;
    right.postMessage(msg);
  });

  // NATIVE APP -> CONTENT SCRIPT
  right.onMessage.addListener((msg) => {
    if (msg.dst === tabid) {
      // The destination is no longer required
      delete(msg.dst);
      left.postMessage(msg);
    }
  });

  // Clean up both endpoints if one of them gets disconnected
  right.onDisconnect.addListener(() => {
    // Deactivate the extension's icon
    chrome.pageAction.hide(tabid);
    // Disconnect the client
    left.disconnect();
  });

  left.onDisconnect.addListener(() => {
    // Decrement the number of connected clients
    right.clients--;
    // Disconnect the native application if no more clients
    if (right.clients === 0) {
      right.disconnect();
      delete(window._app);
    }
  });
});
