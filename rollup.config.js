const pkg = require('./package.json')
const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require('@rollup/plugin-node-resolve')

module.exports = {
  input: './src/index.js',
  output: [
    {
      file: 'dist/index.cjs', // Explicit CommonJS output
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      generatedCode: { constBindings: true }
    },
    {
      file: 'dist/index.mjs', // Explicit ESM output
      format: 'es',
      sourcemap: true,
      exports: 'auto',
      generatedCode: { constBindings: true }
    }
  ],
  external: [
    'path',
    'fs',
    'module',
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    nodeResolve(), // Resolves node_modules dependencies
    commonjs({
      ignoreDynamicRequires: true, // Preserve dynamic require calls
    }),
  ],
  // plugins: [
  //   commonjs({
  //     // Preserve require() calls for user modules
  //     ignoreDynamicRequires: true
  //   })
  // ]
}
