/* eslint-env mocha */
const {expect} = require('chai');

describe('Native messaging communication', function () {
    it('should send and receive messages', (done) => {
        const WebSocket = require('ws');
        const ws = new WebSocket('ws://localhost:8080');
        const clientMessage = 'msg from client';

        ws.on('open', () => {
            ws.send(clientMessage);
        });

        ws.on('message', (data) => {
            // console.log('msg recd by client: ' + data);
            expect(data).to.equal('Native app server sending back: ' + clientMessage);
            ws.close();
            done();
        });
    });
});
