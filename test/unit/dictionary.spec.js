const { dictionaryKeyStartsWithPath } = require('../../src/index.js')

describe('dictionaryKeyStartsWithPath', () => {
  test('finds keys that start with given path', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    const middleware3 = (req, res, next) => next()
    const middleware4 = (req, res, next) => next()
    const middleware5 = (req, res, next) => next()
    
    const dictionary = {
      '/users': [{ fn: middleware1, priority: 50, sourceIndex: 0, sourcePath: '/users' }],
      '/users/profile': [{ fn: middleware2, priority: 50, sourceIndex: 0, sourcePath: '/users/profile' }],
      '/users/settings': [{ fn: middleware3, priority: 50, sourceIndex: 0, sourcePath: '/users/settings' }],
      '/posts': [{ fn: middleware4, priority: 50, sourceIndex: 0, sourcePath: '/posts' }],
      '/admin/users': [{ fn: middleware5, priority: 50, sourceIndex: 0, sourcePath: '/admin/users' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/settings')
    expect(result).toEqual([middleware1, middleware2])
  })

  test('returns empty array when no matches found', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    
    const dictionary = {
      '/posts': [{ fn: middleware1, priority: 50, sourceIndex: 0, sourcePath: '/posts' }],
      '/admin': [{ fn: middleware2, priority: 50, sourceIndex: 0, sourcePath: '/admin' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users')
    expect(result).toEqual([])
  })

  test('handles exact path matches', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    
    const dictionary = {
      '/users': [{ fn: middleware1, priority: 50, sourceIndex: 0, sourcePath: '/users' }],
      '/users/profile': [{ fn: middleware2, priority: 50, sourceIndex: 0, sourcePath: '/users/profile' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/settings')
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(middleware1)
  })

  test('handles empty dictionary', () => {
    const result = dictionaryKeyStartsWithPath({}, '/users')
    expect(result).toEqual([])
  })

  test('handles root path', () => {
    const rootMiddleware = (req, res, next) => next()
    const userMiddleware = (req, res, next) => next()
    const postMiddleware = (req, res, next) => next()
    
    const dictionary = {
      '/': [{ fn: rootMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/' }],
      '/users': [{ fn: userMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/users' }],
      '/posts': [{ fn: postMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/posts' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/posts')
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(rootMiddleware)
    expect(result[1]).toBe(userMiddleware)
  })

  test('sorts results by key length (shortest first)', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    const middleware3 = (req, res, next) => next()
    
    const dictionary = {
      '/users/profile/settings': [{ fn: middleware3, priority: 50, sourceIndex: 0, sourcePath: '/users/profile/settings' }],
      '/users': [{ fn: middleware1, priority: 50, sourceIndex: 0, sourcePath: '/users' }],
      '/users/profile': [{ fn: middleware2, priority: 50, sourceIndex: 0, sourcePath: '/users/profile' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/settings/advanced')
    expect(result).toEqual([middleware1, middleware2, middleware3])
  })

  test('throws error for invalid dictionary (null/undefined)', () => {
    expect(() => dictionaryKeyStartsWithPath(null, '/users')).toThrow('Dictionary must be an object')
    expect(() => dictionaryKeyStartsWithPath(undefined, '/users')).toThrow('Dictionary must be an object')
  })

  test('throws error for invalid dictionary (non-object types)', () => {
    expect(() => dictionaryKeyStartsWithPath('string', '/users')).toThrow('Dictionary must be an object')
    expect(() => dictionaryKeyStartsWithPath(123, '/users')).toThrow('Dictionary must be an object')
    expect(() => dictionaryKeyStartsWithPath(true, '/users')).toThrow('Dictionary must be an object')
    expect(() => dictionaryKeyStartsWithPath(false, '/users')).toThrow('Dictionary must be an object')
  })

  test('handles legacy format (plain functions) for backward compatibility', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    
    // Legacy format: plain functions instead of priority objects
    const dictionary = {
      '/users': [middleware1],
      '/users/profile': middleware2  // Single function, not array
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/settings')
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(middleware1)
    expect(result[1]).toBe(middleware2)
  })

  test('filters out null values from middleware arrays', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    
    const dictionary = {
      '/users': [{ fn: middleware1, priority: 50, sourceIndex: 0, sourcePath: '/users' }, null],
      '/users/profile': [{ fn: middleware2, priority: 50, sourceIndex: 0, sourcePath: '/users/profile' }]
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/settings')
    expect(result).toEqual([middleware1, middleware2])
  })

  test('handles mixed format (legacy and new) in same dictionary', () => {
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    const middleware3 = (req, res, next) => next()
    
    const dictionary = {
      '/users': [middleware1], // Legacy format
      '/users/profile': [{ fn: middleware2, priority: 30, sourceIndex: 0, sourcePath: '/users/profile' }], // New format
      '/users/settings': middleware3 // Legacy single function
    }
    
    const result = dictionaryKeyStartsWithPath(dictionary, '/users/profile/advanced')
    expect(result).toHaveLength(2)
    // middleware2 should come first due to its priority of 30 vs default 50 for middleware1
    expect(result[0]).toBe(middleware2)
    expect(result[1]).toBe(middleware1)
  })
})