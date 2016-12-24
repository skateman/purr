'use strict';

describe('content.js', () => {
  beforeEach(mockChromeContent);

  afterEach(() => delete(window._ext));

  describe('#toBrowser', () => {
    it('returns with undefined', () => {
      expect(toBrowser('message')).to.equal(undefined);
    });

    it('raises a Purr.Response event', (done) => {
      testEventDetail('Purr.Response', done, (detail) => {
        expect(detail).to.equal('message');
      });

      toBrowser('message');
    });
  });

  describe('#backgroundExtension', () => {
    context('no established connection', () => {
      it('sets the hidden global', () => {
        expect(window._ext).to.be.undefined;

        let ext = backgroundExtension();

        expect(window._ext).to.equal(ext);
      });
    });

    context('connection already established', () => {
      beforeEach(() => backgroundExtension());

      it('does not create a new hidden global', () => {
        expect(window._ext).to.be.not.undefined;

        let ext = window._ext;
        backgroundExtension();

        expect(window._ext).to.equal(ext);
      });
    });

    context('incoming background message', () => {
      beforeEach(() => backgroundExtension());

      it('forwards it to the browser', (done) => {
        testEventDetail('Purr.Response', done, (detail) =>
          expect(detail).to.equal('message')
        );

        window._ext.onMessage.addListener.yield('message');
      });
    });

    context('background disconnected', () => {
      beforeEach(() => backgroundExtension());

      it('destroys the hidden global', () => {
        expect(window._ext).to.not.be.undefined;

        window._ext.onDisconnect.addListener.yield();

        expect(window._ext).to.be.undefined;
      });

      it('informs the browser', (done) => {
        testEventDetail('Purr.Response', done, (detail) =>
          expect(detail.status).to.equal('disconnected')
        );

        window._ext.onDisconnect.addListener.yield();
      });
    });
  });

  context('incoming browser message', () => {
    it('sets up a background connection', () => {
      expect(window._ext).to.be.undefined;

      let event = new Event('Purr.Request');
      document.dispatchEvent(event);

      expect(window._ext).to.not.be.undefined;
    });

    it('forwards it to the background', () => {
      let event = new CustomEvent('Purr.Request', { detail: 'message'});
      document.dispatchEvent(event);

      expect(window._ext.postMessage.calledOnce).to.be.true;
    });
  });
});
