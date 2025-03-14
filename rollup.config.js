const pkg = require('./package.json')

module.exports = {
  input: './src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      generatedCode: {
        constBindings: true
      }
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      generatedCode: {
        constBindings: true
      }
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: []
}
