export default {
  displayName: 'integration-esm',
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: [
    '**/*.spec.js',
  ],
  transform: {},
  testTimeout: 15000,
  verbose: true,
  preset: null,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
  resetModules: true
};
