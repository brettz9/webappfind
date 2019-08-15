const fs = require('fs');
const homedir = require('os').homedir();
const ini = require('ini');

const profiles = ini.parse(
  fs.readFileSync(`${homedir}/Library/Application Support/Firefox/profiles.ini`, 'utf-8')
);
console.log(JSON.stringify({profiles}));
