import globals from 'globals'
import pluginJs from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginJest from 'eslint-plugin-jest'

export default [
  prettier,  // Move prettier to the start
  pluginJs.configs.recommended,
  {
    files: ["scripts/**/*.js", "src/**/*.js", "examples/**/*.js" ],
    languageOptions: {
      globals: globals.node,
      sourceType: "module"
    },
    rules: {
      quotes: ['warn', 'single'],
      semi: ['warn', 'never']
    }
  },
  {
    files: ["*.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "module"
    },
    rules: {
      quotes: ['warn', 'single'],
      semi: ['warn', 'never']
    }
  },
  {
    files: ["*.mjs"],
    languageOptions: {
      globals: globals.node,
      sourceType: "module"
    },
    rules: {
      // Rules specific to .mjs files
    }
  },
  {
    files: ['test/**/*.spec.js'],
    plugins: {jest: pluginJest},
    languageOptions: {
      globals: {
        ...globals.node,
        ...pluginJest.environments.globals.globals,
        setImmediate: true,
        clearImmediate: true
      },
      sourceType: "commonjs"
    },
    rules: {
      quotes: ['warn', 'single'],
      semi: ['warn', 'never'],
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
]
