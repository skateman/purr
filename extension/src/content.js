'use strict';

const toBrowser = (msg) => {
  const event = new CustomEvent('Purr.Response', { detail: msg });
  document.dispatchEvent(event);
};

const backgroundExtension = () => {
  // Connect to the extension's background script if not already connected
  if (window._ext === undefined) {
    window._ext = chrome.runtime.connect();
    // Clean up if the extension gets disconnected
    window._ext.onDisconnect.addListener(() => delete(window._ext));

    // BACKROUND SCRIPT -> BROWSER PAGE
    window._ext.onMessage.addListener(toBrowser);
    // Inform the browser upon disconnect
    window._ext.onDisconnect.addListener(() => toBrowser({ status: 'disconnected' }));
  }
  return window._ext;
};

// Receive messages from the browser
document.addEventListener('Purr.Request', (event) => {
  const ext = backgroundExtension();

  // BROWSER PAGE -> BACKROUND SCRIPT
  ext.postMessage(event.detail);
});
