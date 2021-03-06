/* eslint-env node */
/* eslint-disable promise/prefer-await-to-callbacks, promise/avoid-new,
  node/prefer-promises/fs */

const fs = require('fs');
const {execFile} = require('child_process');

const readFileProm = (path, options) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path,
      options || {}, // Default to empty object for pkg: https://github.com/zeit/pkg/issues/483
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
const writeFileProm = (path, data) => {
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

const readdirProm = (path, options) => {
  return new Promise((resolve, reject) => {
    fs.readdir(
      path,
      options || {}, // Default to empty object for pkg: https://github.com/zeit/pkg/issues/483
      (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(files);
      }
    );
  });
};

const unlinkProm = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const statProm = (path) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stats);
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

const isWin = process.platform.startsWith('win');
if (isWin) {
  // eslint-disable-next-line node/global-require
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

const execFileProm = (file, args, options) => {
  return new Promise((resolve, reject) => {
    return execFile(
      file,
      args,
      options || {}, // Default to empty object for pkg: https://github.com/zeit/pkg/issues/483
      (error, stdout, stderr) => {
        if (error) {
          const err = new Error('Exec error: ' + error);
          err.error = error;
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
          return;
        }
        resolve([stdout, stderr]);
      }
    );
  });
};

exports.readFileProm = readFileProm;
exports.writeFileProm = writeFileProm;
exports.readdirProm = readdirProm;
exports.unlinkProm = unlinkProm;
exports.statProm = statProm;
exports.copyExecutable = copyExecutable;
exports.copyFile = copyFile;
exports.execFileProm = execFileProm;
