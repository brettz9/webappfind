import rootImport from 'rollup-plugin-root-import';

function getRollupObject ({format = 'iife'} = {}) {
  const nonMinified = {
    input: 'atyourcommand/one-off.js',
    output: {
      format,
      sourcemap: true,
      file: `atyourcommand/one-off-bundled.js`
    },
    plugins: [
      rootImport({
        root: __dirname
      })
    ]
  };
  return nonMinified;
}

/* eslint-disable-next-line import/no-anonymous-default-export */
export default [
  getRollupObject()
];
