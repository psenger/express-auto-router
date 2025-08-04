const lib = require('../../dist/index.cjs').default

describe('composeRoutes', () => {

  test('should composeRoutes be defined', () => {
    expect(lib).toBeDefined()
  })
  test('should be a function', () => {
    expect(typeof lib.composeRoutes).toBe('function')
  })

  test('should be defined and usable', () => {
    expect(lib.composeRoutes).toBeDefined()
    expect(() => {
      if (typeof lib.composeRoutes !== 'function') {
        throw new Error('composeRoutes is not a function')
      }
    }).not.toThrow()
  })
})
