const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    ws.send('msg from client');
});

ws.on('message', (data) => {
    console.log('msg recd by client: ' + data);
});
