/* eslint-env mocha */
const {expect} = require('chai');

describe('Native messaging communication', function () {
    it('should send and receive messages', (done) => {
        const WebSocket = require('ws');
        const ws = new WebSocket('ws://localhost:8080');

        ws.on('open', () => {
            ws.send('msg from client');
        });

        ws.on('message', (data) => {
            console.log('msg recd by client: ' + data);
            expect(data).to.equal('server sending something');
            ws.close();
            done();
        });
    });
});
