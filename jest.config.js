module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageProvider: "v8",
  coverageReporters: [
    "lcov",
  ],
  reporters: [
    'default',
    ['./node_modules/jest-html-reporters', {
      publicPath: 'coverage',
      filename: 'index.html',
      openReport: false
    }]
  ],
  testMatch: [
    '**/test/**/*.spec.js', // Updated pattern to match ./test/*.spec.js
  ],
  transform: {},
  testEnvironment: 'node'
};
