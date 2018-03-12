/* eslint-env node */

const fs = require('fs');
const mkdirpOriginal = require('mkdirp');
const {execFile: execFileOriginal} = require('child_process');

const mkdirp = (dirPath, opts) => {
    return new Promise((resolve, reject) => {
        mkdirpOriginal(dirPath, opts, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const readFile = (path, options) => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path,
            options,
            (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            }
        );
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

const readdir = (path, options) => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, options, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(files);
        });
    });
};

function copyFile (source, target) {
    return copyFileUtil(source, target);
}

// Inspired by https://stackoverflow.com/a/14387791/271577
function copyExecutable (source, target) {
    return copyFileUtil(
        source,
        target,
        {flags: 'r', encoding: 'binary'},
        {
            flags: 'w',
            encoding: 'binary',
            mode: fs.constants.S_IRWXU // Readable, writable, executable by owner (user)
        }
    );
}
function copyFileUtil (source, target, readOptions, writeOptions) {
    return new Promise((resolve, reject) => {
        let cbCalled = false;

        const rd = fs.createReadStream(source, readOptions);
        rd.on('error', (err) => {
            done(err);
        });
        const wr = fs.createWriteStream(target, writeOptions);
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

const execFile = (file, args, options) =>
    new Promise((resolve, reject) => {
        execFileOriginal(file, args, options, (error, stdout, stderr) => {
            if (error) {
                const err = new Error('Exec error' + error);
                err.error = error;
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
                return;
            }
            resolve([stdout, stderr]);
        });
    });

exports.mkdirp = mkdirp;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.readdir = readdir;
exports.copyExecutable = copyExecutable;
exports.copyFile = copyFile;
exports.execFile = execFile;
