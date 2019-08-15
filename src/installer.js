#!/usr/bin/env node
/* eslint-disable node/no-unpublished-bin */
const {localInstall} = require('./install');

const userInstallType = process.argv[2];

localInstall({userInstallType});
