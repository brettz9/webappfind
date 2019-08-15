/*
const npm = require('npm');
npm.load(() => {
    npm.search('testing node', (...args) => {
        console.log(...args);
    });
});
*/
const npmKeyword = require('npm-keyword');

npmKeyword('firefox').then((packages) => {
  console.log('packages', packages);
  return true;
}).catch(() => {
  console.log('Erred');
});
