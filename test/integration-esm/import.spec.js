import module from '../../dist/index.mjs'
const composeRoutes = module.default

describe('composeRoutes', () => {
  test('should be a function', () => {
    expect(typeof composeRoutes).toBe('function');
  });

  test('should be defined and usable', () => {
    expect(composeRoutes).toBeDefined();
    expect(() => {
      if (typeof composeRoutes !== 'function') {
        throw new Error('composeRoutes is not a function');
      }
    }).not.toThrow();
  });
});
