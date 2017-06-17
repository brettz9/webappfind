const {localInstall} = require('./install');

const userInstallType = process.argv[2];

localInstall({userInstallType});
