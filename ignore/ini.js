const fs = require('fs');
const ini = require('ini');
const homedir = require('os').homedir();
const profiles = ini.parse(
    fs.readFileSync(`${homedir}/Library/Application Support/Firefox/profiles.ini`, 'utf-8')
);
console.log(JSON.stringify({profiles}));
