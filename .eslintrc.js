module.exports = {
  extends: "ash-nazg/sauron-node",
  env: {
    node: true
  },
  settings: {
    polyfills: [
      'Object.assign',
      'Object.entries',
      'Promise',
      'URL',
      'URLSearchParams'
    ]
  },
  globals: {
    __dirname: true,
    exports: true,
    module: true,
    require: true
  },
  rules: {
    // Reenable later
    strict: 0,
    "prefer-object-spread": 0,
    "max-len": 0,
    "no-shadow": 0,
    "no-console": 0,
    "require-atomic-updates": 0,
    "require-unicode-regexp": 0,
    "require-await": 0,
    "prefer-named-capture-group": 0,
    "jsdoc/require-jsdoc": 0,
    "no-sync": 0,
    "node/exports-style": 0,
    "node/no-unpublished-import": 0,
    "node/no-missing-require": 0,
    "node/no-missing-import": 0,
    "import/no-unresolved": 0,
    "import/unambiguous": 0,
    "import/no-absolute-path": 0,
    "import/no-commonjs": 0
  }
};
