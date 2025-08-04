const { isMiddlewareFile, normalizeMiddlewarePriority, sortMiddlewareFunctions } = require('../../src/index.js')

describe('isMiddlewareFile', () => {
  test('identifies middleware files', () => {
    const middlewareFile = { isFile: () => true, name: '_middleware.js' }
    expect(isMiddlewareFile(middlewareFile)).toBe(true)
  })

  test('rejects directories with middleware name', () => {
    const middlewareDir = { isFile: () => false, name: '_middleware.js' }
    expect(isMiddlewareFile(middlewareDir)).toBe(false)
  })

  test('rejects other files', () => {
    const indexFile = { isFile: () => true, name: 'index.js' }
    expect(isMiddlewareFile(indexFile)).toBe(false)
    
    const otherFile = { isFile: () => true, name: 'controller.js' }
    expect(isMiddlewareFile(otherFile)).toBe(false)
  })
})

describe('normalizeMiddlewarePriority', () => {
  test('normalizes single middleware function', () => {
    const middleware = (req, res, next) => next()
    const result = normalizeMiddlewarePriority(middleware, 0, '/test')
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      fn: middleware,
      priority: 50,
      sourceIndex: 0,
      sourcePath: '/test'
    })
  })

  test('normalizes array of middleware functions', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    const middlewareArray = [middleware1, middleware2]
    
    const result = normalizeMiddlewarePriority(middlewareArray, 5, '/test')
    
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      fn: middleware1,
      priority: 50,
      sourceIndex: 5,
      sourcePath: '/test'
    })
    expect(result[1]).toEqual({
      fn: middleware2,
      priority: 50,
      sourceIndex: 6,
      sourcePath: '/test'
    })
  })

  test('handles middleware with priority property', () => {
    const middleware = (req, res, next) => next()
    middleware.priority = 10
    
    const result = normalizeMiddlewarePriority(middleware, 0, '/test')
    
    expect(result[0].priority).toBe(50)
  })

  test('handles middleware with priority object format', () => {
    const middleware = (req, res, next) => next()
    const priorityObject = { fn: middleware, priority: 25 }
    
    const result = normalizeMiddlewarePriority(priorityObject, 0, '/test')
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      fn: middleware,
      priority: 25,
      sourceIndex: 0,
      sourcePath: '/test'
    })
  })

  test('handles middleware with priority object without priority property', () => {
    const middleware = (req, res, next) => next()
    const priorityObject = { fn: middleware }
    
    const result = normalizeMiddlewarePriority(priorityObject, 0, '/test')
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      fn: middleware,
      priority: 50,
      sourceIndex: 0,
      sourcePath: '/test'
    })
  })

  test('throws error for invalid middleware (non-function)', () => {
    expect(() => normalizeMiddlewarePriority('invalid', 0, '/test')).toThrow(
      'Invalid middleware: must be function or {fn, priority} object'
    )
    
    expect(() => normalizeMiddlewarePriority(123, 0, '/test')).toThrow(
      'Invalid middleware: must be function or {fn, priority} object'
    )
  })

  test('throws error for invalid priority object without fn property', () => {
    expect(() => normalizeMiddlewarePriority({ priority: 10 }, 0, '/test')).toThrow(
      'Invalid middleware: must be function or {fn, priority} object'
    )
    
    expect(() => normalizeMiddlewarePriority({ fn: 'not-a-function' }, 0, '/test')).toThrow(
      'Invalid middleware: must be function or {fn, priority} object'
    )
  })

  test('handles array with mixed valid and invalid middleware', () => {
    const validMiddleware = (req, res, next) => next()
    const invalidMiddleware = 'invalid'
    
    expect(() => normalizeMiddlewarePriority([validMiddleware, invalidMiddleware], 0, '/test')).toThrow(
      'Invalid middleware: must be function or {fn, priority} object'
    )
  })
})

describe('sortMiddlewareFunctions', () => {
  test('sorts by priority then sourceIndex', () => {
    const middlewareArray = [
      { fn: 'c', priority: 2, sourceIndex: 0, sourcePath: '/c' },
      { fn: 'a', priority: 1, sourceIndex: 0, sourcePath: '/a' },
      { fn: 'b', priority: 1, sourceIndex: 1, sourcePath: '/a' },
      { fn: 'd', priority: 3, sourceIndex: 0, sourcePath: '/d' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    expect(result).toEqual(['a', 'b', 'c', 'd'])
  })

  test('handles empty array', () => {
    expect(sortMiddlewareFunctions([])).toEqual([])
  })

  test('handles single middleware', () => {
    const single = [{ fn: 'test', priority: 1, sourceIndex: 0, sourcePath: '/test' }]
    expect(sortMiddlewareFunctions(single)).toEqual(['test'])
  })

  test('sorts by function name when priorities are equal', () => {
    const middlewareA = function authMiddleware() {}
    const middlewareB = function corsMiddleware() {}
    const middlewareC = function loggingMiddleware() {}
    
    const middlewareArray = [
      { fn: middlewareC, priority: 10, sourceIndex: 0, sourcePath: '/api' },
      { fn: middlewareA, priority: 10, sourceIndex: 1, sourcePath: '/api' },
      { fn: middlewareB, priority: 10, sourceIndex: 2, sourcePath: '/api' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    expect(result).toEqual([middlewareA, middlewareB, middlewareC])
  })

  test('sorts anonymous functions after named functions', () => {
    const namedMiddleware = function namedFunction() {}
    // Create truly anonymous functions by clearing their names
    const anonymousMiddleware1 = function() {}
    const anonymousMiddleware2 = function() {}
    // Clear the names to make them truly anonymous
    Object.defineProperty(anonymousMiddleware1, 'name', { value: '', configurable: true })
    Object.defineProperty(anonymousMiddleware2, 'name', { value: '', configurable: true })
    
    const middlewareArray = [
      { fn: anonymousMiddleware1, priority: 10, sourceIndex: 0, sourcePath: '/api' },
      { fn: namedMiddleware, priority: 10, sourceIndex: 1, sourcePath: '/api' },
      { fn: anonymousMiddleware2, priority: 10, sourceIndex: 2, sourcePath: '/api' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    // Named functions should come first, then anonymous functions in source order
    expect(result[0]).toBe(namedMiddleware)
    expect(result[1]).toBe(anonymousMiddleware1)
    expect(result[2]).toBe(anonymousMiddleware2)
  })

  test('sorts anonymous functions by sourceIndex when names are equal', () => {
    // Create truly anonymous functions
    const anonymous1 = function() {}
    const anonymous2 = function() {}
    const anonymous3 = function() {}
    Object.defineProperty(anonymous1, 'name', { value: '', configurable: true })
    Object.defineProperty(anonymous2, 'name', { value: '', configurable: true })
    Object.defineProperty(anonymous3, 'name', { value: '', configurable: true })
    
    const middlewareArray = [
      { fn: anonymous3, priority: 10, sourceIndex: 2, sourcePath: '/api' },
      { fn: anonymous1, priority: 10, sourceIndex: 0, sourcePath: '/api' },
      { fn: anonymous2, priority: 10, sourceIndex: 1, sourcePath: '/api' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    expect(result).toEqual([anonymous1, anonymous2, anonymous3])
  })

  test('sorts by source path length as final tiebreaker', () => {
    // Create middleware functions with the SAME name to trigger the final tiebreaker
    const middleware1 = function() {}
    const middleware2 = function() {}
    const middleware3 = function() {}
    Object.defineProperty(middleware1, 'name', { value: '', configurable: true })
    Object.defineProperty(middleware2, 'name', { value: '', configurable: true })
    Object.defineProperty(middleware3, 'name', { value: '', configurable: true })
    
    const middlewareArray = [
      { fn: middleware3, priority: 10, sourceIndex: 0, sourcePath: '/api/users/profile' },
      { fn: middleware1, priority: 10, sourceIndex: 0, sourcePath: '/api' },
      { fn: middleware2, priority: 10, sourceIndex: 0, sourcePath: '/api/users' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    expect(result).toEqual([middleware1, middleware2, middleware3])
  })

  test('handles complex sorting scenario', () => {
    const namedHigh = function namedHigh() {}
    const namedLow = function namedLow() {}
    const anonymousHigh = function() {}
    const anonymousLow = function() {}
    Object.defineProperty(anonymousHigh, 'name', { value: '', configurable: true })
    Object.defineProperty(anonymousLow, 'name', { value: '', configurable: true })
    
    const middlewareArray = [
      { fn: anonymousLow, priority: 20, sourceIndex: 1, sourcePath: '/api' },
      { fn: namedHigh, priority: 10, sourceIndex: 0, sourcePath: '/api' },
      { fn: anonymousHigh, priority: 10, sourceIndex: 1, sourcePath: '/api' },
      { fn: namedLow, priority: 20, sourceIndex: 0, sourcePath: '/api' }
    ]
    
    const result = sortMiddlewareFunctions(middlewareArray)
    
    // Expected order: priority 10 first (namedHigh, then anonymousHigh), then priority 20 (namedLow, then anonymousLow)
    expect(result).toEqual([namedHigh, anonymousHigh, namedLow, anonymousLow])
  })
})