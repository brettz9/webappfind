#!/usr/bin/env node

const {localInstall} = require('../src/install');
const {execFile: execFileOriginal} = require('child_process');

const execFile = (file, args, options) =>
    new Promise((resolve, reject) => {
        execFileOriginal(file, args, options, (error, stdout, stderr) => {
            if (error) {
                const err = new Error('Exec error');
                err.error = error;
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
                return;
            }
            resolve([stdout, stderr]);
        });
    });

// Todo: Switch to minimist, etc. for parsing args

const command = process.argv[2];
console.log('RUNNING COMMAND', command);
switch (command) {
case 'pkg-native-apps': {
    pkgNativeApps();
    break;
} case 'installer': {
    // TODO
    break;
} case 'pkg-installer': {
    pkgInstaller();
    break;
} case 'install': {
    const userInstallType = process.argv[3];
    const buildInfoIntoName = !!process.argv[4];
    localInstall({userInstallType, buildInfoIntoName});
    break;
} case 'pkg-install': {
    const userInstallType = process.argv[3];
    const buildInfoIntoName = !!process.argv[4];
    localInstall({userInstallType, buildInfoIntoName, pkg: true});
    break;
} default: {
    console.log(
        'Command type supplied to `webappfind` must be one of: ' +
            'native-apps|installer|install'
    );
    break;
}
}

function getAllTargets () {
    // return ['node7-macos-x64'];
    /**/
    return [
        'node7-linux-x64',
        'node7-linux-x86',
        'node7-linux-armv6',
        'node7-linux-armv7',
        'node7-macos-x64',
        'node7-macos-x86',
        'node7-win-x64',
        'node7-win-x86'
    ];
    // */
    /*
    // WORKS as above
    const nodeVersion = process.version.match(/^v(\d+)/)[1]; // Although pkg accepts absence, we want it for file name
    const targets = [];
    ['linux', 'macos', 'win'].forEach((platform, i) => {
        const archs = ['x64', 'x86'].concat(i === 0 ? ['armv6', 'armv7'] : []);
        targets.push(...archs.map((arch) => {
            return 'node' + nodeVersion + '-' + platform + '-' + arch;
        }));
    });
    console.log(targets);
    return targets;
    */
}

function pkgNativeApps () {
    const pkgFile = 'native-app.js';
    let targets = process.argv[3] || '';
    targets = targets === 'all' ? getAllTargets() : targets.split(',');
    return Promise.all(
        targets.map((target) => {
            console.log('target', target);
            const args = target ? [
                pkgFile,
                '--targets', target,
                '-o', `bin/${target}-native-app`
            ] : [
                pkgFile,
                '-o', `bin/native-app`
            ];
            // console.log(args.join(' '));
            return execFile('pkg', args);
        })
    ).then(() => {
        console.log('Completing building native-apps');
    }).catch((err) => {
        console.log('Error building native-apps', err.error);
    });
}

function pkgInstaller () {
    // We need `pkg` config (for specifying dynamic require assets) so
    //    we set to `package.json` here.
    const pkgFile = 'package.json'; // 'src/installer.js';
    // `targets` includes "host" for own machine; empty string follows defaults of
    //    native machine Node/architecture with Linux/Mac/Windows
    let targets = process.argv[3] || '';
    targets = targets === 'all' ? getAllTargets() : targets.split(',');
    return Promise.all(
        targets.map((target) => {
            const args = target ? [
                pkgFile,
                '--targets', target,
                '-o', `bin/${target}-installer`
            ] : [
                pkgFile,
                '-o', `bin/installer`
            ];
            return execFile('pkg', args);
        })
    ).then(() => {
        console.log('Completed installer build!');
    }).catch((err) => {
        console.log('Error building installer', err.error);
    });
}
