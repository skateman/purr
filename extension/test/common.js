'use strict';

const mockChromeContent = () => window.chrome = {
  runtime: {
    connect: sinon.stub().returns({
      onDisconnect: {
        addListener: sinon.stub()
      },
      onMessage: {
        addListener: sinon.stub()
      },
      postMessage: sinon.stub()
    })
  }
};

const mockChromeBackground = () => window.chrome = {
  runtime: {
    onConnect: {
      addListener: sinon.stub().returns({
        onDisconnect: {
          addListener: sinon.stub()
        },
        onMessage: {
          addListener: sinon.stub()
        }
      })
    },
    connectNative: sinon.stub().returns({
      onConnect: {
        addListener: sinon.stub()
      },
      onDisconnect: {
        addListener: sinon.stub()
      },
      onMessage: {
        addListener: sinon.stub()
      },
      postMessage: sinon.stub(),
      disconnect: sinon.stub(),
    })
  },
  pageAction: {
    show: sinon.stub(),
    hide: sinon.stub()
  }
};

const mockChromeClient = id => ({
  onDisconnect: {
    addListener: sinon.stub()
  },
  onMessage: {
    addListener: sinon.stub()
  },
  postMessage: sinon.stub(),
  disconnect: sinon.stub(),
  sender: {
    tab: {
      id: id
    }
  }
});

const testEventDetail = (name, done, expect) => document.addEventListener(name, (event) =>
  new Promise(resolve => resolve(event.detail))
    .then(detail => expect(detail))
    .then(() => done())
    .catch(error => done(error))
);

mockChromeContent();
mockChromeBackground();
