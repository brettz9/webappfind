/* eslint-env mocha */
const {expect} = require('chai');

describe('Native messaging communication', function () {
  it('should send and receive messages', (done) => {
    // eslint-disable-next-line global-require
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:8080');
    const testFile = 'test123.js';

    ws.on('open', () => {
      ws.send(JSON.stringify({
        method: 'client',
        file: testFile
      }));
    });

    ws.on('message', (msg) => {
      const msgObj = JSON.parse(msg);
      const {prop, value} = msgObj;
      // console.log('msg recd by client: ' + data);
      expect(prop, 'Native app server sending back: file property').to.equal('file');
      expect(value, 'Native app server sending back: file value').to.equal(testFile);
      ws.close();
      done();
    });
  });
});
