require('fs').writeFile('/Users/brett/webappfind/app-' + new Date() + '.json', '{}', (err) => {
    console.log('err', err);
});

/*
// #!/usr/bin/env node
*/

/*
0. Todo: Dynamically generate "path" in waf.json
0. Todo: Keep this listening hidden (and persistent): http://superuser.com/questions/62525/run-a-batch-file-in-a-completely-hidden-way
*/
console.log('["abc"]');

// console.log('"hello2"');
/*
console.log('["abc"]');
console.log(
    process.argv.slice(2)
);
console.log(
    process.argv.slice(0, 2)
);
*/
/*
require('http').createServer((req, res) => {
    // Todo: Listen for arguments when invoked and pass on

    const extra = req.url === '/test/' ? 'index.html' : '';
    const s = require('fs').createReadStream('.' + req.url + extra);
    s.pipe(res);
    s.on('error', function () {});
}).listen(8085);
console.log('Started server; open http://localhost:8085/test/ in the browser');
*/

/**/
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        process.stdout.write(`data: ${chunk}`);
    }
});
process.stdin.on('end', () => {
    process.stdout.write('end');
});
// */

/*
require('readline')
    .createInterface(process.stdin, process.stdout)
    .question("Press [Enter] to exit...", function(){
        process.exit();
});
*/
