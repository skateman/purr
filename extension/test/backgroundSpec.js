'use strict';

describe('background.js', () => {
  describe('#nativeApp', () => {
    afterEach(() => delete(window._app));

    context('no established connection', () => {
      it('sets the hidden global', () => {
        expect(window._app).to.be.undefined;

        let app = nativeApp();

        expect(window._app).to.equal(app);
      });
    });

    context('connection already established', () => {
      beforeEach(() => nativeApp());

      it('does not create a new hidden global', () => {
        expect(window._app).to.be.not.undefined;

        let app = window._app;
        nativeApp();

        expect(window._app).to.equal(app);
      });
    });

    context('disconnected', () => {
      beforeEach(() => nativeApp());

      it('destroys the hidden global', () => {
        expect(window._app).to.not.be.undefined;

        window._app.onDisconnect.addListener.yield();

        expect(window._app).to.be.undefined;
      });
    });
  });

  context('single client connected', () => {
    before(() => {
      this.tabId = 0;
      this.client = mockChromeClient(tabId);
      chrome.runtime.onConnect.addListener.yield(this.client);
    });

    after(() => delete(window._app));

    it('sets up the native app connection', () => {
      expect(window._app).to.not.be.undefined;
    });

    it('activates the extension icon', () => {
      expect(chrome.pageAction.show.calledOnce).to.be.true
      expect(chrome.pageAction.show.calledWith(tabId)).to.be.true
    });

    it('forwards client messages with tabId appended to the native app', () => {
      window._app.postMessage.reset()
      client.onMessage.addListener.yield({message: 'hello'});

      expect(window._app.postMessage.calledWith({message: 'hello', src: tabId})).to.be.true
    });

    context('message from the native app', () => {
      beforeEach(() => client.postMessage.reset());

      it('forwards it to the client', () => {
        window._app.onMessage.addListener.yield({message: 'hello', dst: tabId});

        expect(client.postMessage.calledWith({message: 'hello'})).to.be.true
      });

      context('destination other than the client tab id', () => {
        it('does not forward the message', () => {
          window._app.onMessage.addListener.yield({message: 'hello', dst: 2});

          expect(client.postMessage.calledWith({message: 'hello'})).to.not.be.true
        });
      });
    });

    context('client disconnected', () => {
      before(() => {
        chrome.pageAction.hide.reset();
        this.app = window._app;
        this.client.onDisconnect.addListener.yield()
      });

      it('closes the native app connection', () => {
        expect(app.disconnect.calledOnce).to.be.true;
        expect(window._app).to.be.undefined;
      });
    });
  });

  context('multiple clients connected', () => {
    before(() => {
      this.tabIdA = 1;
      this.clientA = mockChromeClient(tabIdA);
      chrome.runtime.onConnect.addListener.yield(clientA);
      this.tabIdB = 2;
      this.clientB = mockChromeClient(tabIdB);
      chrome.runtime.onConnect.addListener.yield(clientB);
      window._app.disconnect.reset();
    });

    after(() => delete(window._app));

    it('forwards client messages with tabId appended to the native app', () => {
      clientA.onMessage.addListener.yield({message: 'hello'});
      expect(window._app.postMessage.calledWith({message: 'hello', src: tabIdA})).to.be.true
      clientB.onMessage.addListener.yield({message: 'hello'});
      expect(window._app.postMessage.calledWith({message: 'hello', src: tabIdB})).to.be.true
    });

    it('forwards native app messages to the clients adjacently', () => {
      window._app.onMessage.addListener.yield({message: 'hello', dst: tabIdA});
      expect(clientA.postMessage.calledWith({message: 'hello'})).to.be.true;
      window._app.onMessage.addListener.yield({message: 'hello', dst: tabIdB});
      expect(clientB.postMessage.calledWith({message: 'hello'})).to.be.true;
    });

    context('single client gets disconnected', () => {
      before(() => this.clientA.onDisconnect.addListener.yield());

      it('does not disconnect the native app', () => {
        expect(window._app.disconnect.calledOnce).to.be.false;
      });

      context('both clients get disconnected', () => {
        before(() => {
          this.app = window._app;
          this.clientB.onDisconnect.addListener.yield();
        });

        it('closes the connection to the native app', () => {
          expect(app.disconnect.calledOnce).to.be.true;
          expect(window._app).to.be.undefined;
        });
      });
    });
  });

  context('native app gets disconnected', () => {
    before(() => {
      this.tabIdA = 3;
      this.clientA = mockChromeClient(tabIdA);
      chrome.runtime.onConnect.addListener.yield(this.clientA);
      this.tabIdB = 4;
      this.clientB = mockChromeClient(tabIdB);
      chrome.runtime.onConnect.addListener.yield(this.clientB);
    });

    after(() => delete(window._app));

    it('closes all client connections', () => {
      window._app.onDisconnect.addListener.yield();
      expect(clientA.disconnect.calledOnce).to.be.true;
      expect(chrome.pageAction.hide.calledWith(tabIdA)).to.be.true;
      expect(clientB.disconnect.calledOnce).to.be.true;
      expect(chrome.pageAction.hide.calledWith(tabIdB)).to.be.true;
    });
  });
});
