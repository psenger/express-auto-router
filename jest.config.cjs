module.exports = {
  projects: [
    {
      displayName: 'unit',
      clearMocks: true,
      testEnvironment: 'node',
      coverageDirectory: 'coverage',
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/',
        '/dist/',
      ],
      collectCoverageFrom: [
        'src/**/*.js'
      ],
      testMatch: [
        '**/test/unit/**/*.spec.js'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/test/unit/setup.js'
      ]
    }
  ],
  reporters: [
    'default',
    ['./node_modules/jest-html-reporters', {
      publicPath: 'coverage',
      filename: 'index.html',
      openReport: false
    }]
  ]
}
