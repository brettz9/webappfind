/* eslint-env node */

const fs = require('fs');
const mkdirpOriginal = require('mkdirp');

const mkdirp = (dirPath) => {
    return new Promise((resolve, reject) => {
        mkdirpOriginal(dirPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            path,
            data,
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }
        );
    });
};

// Inspired by https://stackoverflow.com/a/14387791/271577
function copyExecutable (source, target) {
    return new Promise((resolve, reject) => {
        let cbCalled = false;

        const rd = fs.createReadStream(source, {flags: 'r', encoding: 'binary'});
        rd.on('error', (err) => {
            done(err);
        });
        const wr = fs.createWriteStream(target, {
            flags: 'w',
            encoding: 'binary',
            mode: fs.constants.S_IRWXU // Readable, writable, executable by owner (user)
        });
        wr.on('error', (err) => {
            done(err);
        });
        wr.on('close', (ex) => {
            done();
        });
        rd.pipe(wr);

        function done (err) {
            if (cbCalled) {
                return;
            }
            cbCalled = true;
            if (err) {
                reject(err);
                return;
            }
            resolve();
        }
    });
}

const isWin = /^win/.test(process.platform);
if (isWin) {
    const regeditOriginal = require('regedit'); // https://github.com/ironSource/node-regedit
    const regedit = {
        putValue () {
            return new Promise((resolve, reject) => {
                regeditOriginal.putValue();
            });
        }
    };
    exports.regedit = regedit;
}

exports.mkdirp = mkdirp;
exports.writeFile = writeFile;
exports.copyExecutable = copyExecutable;
