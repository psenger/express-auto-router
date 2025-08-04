const { buildMiddlewareDictionary, parseDirectoryPriority, normalizeMiddlewarePriority } = require('../../src/index.js')
const { createTempDir, createRouteDir, createRouteFile, cleanupTempDir } = require('../__support__/test-helpers')
const path = require('path')

describe('buildMiddlewareDictionary', () => {
  let tempDir

  beforeEach(() => {
    tempDir = createTempDir('unit-middleware-')
  })

  afterEach(() => {
    cleanupTempDir(tempDir)
  })

  describe('Basic functionality', () => {
    test('throws error for non-directory base path', async () => {
      // Create a file instead of directory
      const filePath = path.join(tempDir, 'not-a-directory.txt')
      createRouteFile(tempDir, 'not-a-directory.txt', 'some content')

      await expect(buildMiddlewareDictionary(filePath, '/api')).rejects.toThrow(
        `Base path "${filePath}" is not a directory`
      )
    })

    test('handles empty directory (no middleware files)', async () => {
      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')
      expect(Object.keys(dictionary)).toEqual([])
    })

    test('ignores non-middleware files', async () => {
      // Create non-middleware files
      createRouteFile(tempDir, 'index.js', 'module.exports = () => {}')
      createRouteFile(tempDir, 'helper.js', 'module.exports = () => {}')
      createRouteDir(tempDir, 'some-dir')

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')
      expect(Object.keys(dictionary)).toEqual([])
    })
  })

  describe('Middleware processing', () => {
    test('processes single middleware function correctly', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.middleware = true
            next()
          }
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(dictionary['/api/']).toHaveLength(1)
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][0].priority).toBe(50) // Default priority
      expect(dictionary['/api/'][0].sourceIndex).toBe(0)
      expect(dictionary['/api/'][0].sourcePath).toBe('/api/')
    })

    test('processes array of middleware functions correctly', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return [
            (req, res, next) => { req.middleware1 = true; next() },
            (req, res, next) => { req.middleware2 = true; next() }
          ]
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(dictionary['/api/']).toHaveLength(2)
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][0].priority).toBe(50)
      expect(dictionary['/api/'][1].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][1].priority).toBe(50)
    })

    test('processes priority objects correctly', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return [
            { fn: (req, res, next) => next(), priority: 5 },
            { fn: (req, res, next) => next(), priority: 20 }
          ]
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(dictionary['/api/']).toHaveLength(2)
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][0].priority).toBe(5)
      expect(dictionary['/api/'][1].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][1].priority).toBe(20)
    })

    test('processes mixed legacy and priority format middleware', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return [
            (req, res, next) => next(), // Plain function - should get priority 50
            { fn: (req, res, next) => next(), priority: 10 } // Priority object
          ]
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(dictionary['/api/']).toHaveLength(2)
      // Legacy function should be normalized to priority object
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][0].priority).toBe(50)
      // Priority object should maintain its priority
      expect(dictionary['/api/'][1].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/'][1].priority).toBe(10)
    })

    test('passes options parameter to middleware modules', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          if (options && options.testOption === 'testValue') {
            return (req, res, next) => {
              req.middlewareOptions = options
              next()
            }
          }
          throw new Error('Options not passed correctly')
        }
      `)

      const testOptions = { testOption: 'testValue' }
      const dictionary = await buildMiddlewareDictionary(tempDir, '/api', testOptions)

      expect(dictionary['/api/']).toHaveLength(1)
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
    })
  })

  describe('Directory priority handling', () => {
    test('handles priority-prefixed directories correctly', async () => {
      const usersDir = createRouteDir(tempDir, '10-users')
      createRouteFile(usersDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.usersMiddleware = true
            next()
          }
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      // Should use the name without priority prefix
      expect(dictionary['/api/users/']).toBeDefined()
      expect(dictionary['/api/users/']).toHaveLength(1)
      expect(dictionary['/api/users/'][0].fn).toBeInstanceOf(Function)
    })

    test('handles dynamic route parameters correctly', async () => {
      const userIdDir = createRouteDir(tempDir, '[userId]')
      createRouteFile(userIdDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.userIdMiddleware = true
            next()
          }
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      // Should convert [userId] to :userId
      expect(dictionary['/api/:userId/']).toBeDefined()
      expect(dictionary['/api/:userId/']).toHaveLength(1)
    })

    test('handles priority-prefixed dynamic routes correctly', async () => {
      const userIdDir = createRouteDir(tempDir, '15-[userId]')
      createRouteFile(userIdDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.priorityUserMiddleware = true
            next()
          }
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      // Should use name without priority prefix and convert to Express param
      expect(dictionary['/api/:userId/']).toBeDefined()
      expect(dictionary['/api/:userId/']).toHaveLength(1)
    })
  })

  describe('Error handling', () => {
    test('throws error when middleware returns null', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return null
        }
      `)

      await expect(buildMiddlewareDictionary(tempDir, '/api')).rejects.toThrow(
        'must export a function or array of functions'
      )
    })

    test('throws error when middleware returns string', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return "invalid"
        }
      `)

      await expect(buildMiddlewareDictionary(tempDir, '/api')).rejects.toThrow(
        'must export a function or array of functions'
      )
    })

    test('throws error when middleware module throws during execution', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          throw new Error('Middleware execution failed')
        }
      `)

      await expect(buildMiddlewareDictionary(tempDir, '/api')).rejects.toThrow(
        'Failed to load middleware at'
      )
      await expect(buildMiddlewareDictionary(tempDir, '/api')).rejects.toThrow(
        'Middleware execution failed'
      )
    })

    test('throws error when middleware file has syntax error', async () => {
      createRouteFile(tempDir, '_middleware.js', `
        this is not valid javascript
      `)

      await expect(buildMiddlewareDictionary(tempDir, '/api')).rejects.toThrow(
        'Failed to load middleware at'
      )
    })
  })

  describe('Complex scenarios', () => {
    test('handles nested directory structure with multiple middleware files', async () => {
      // Global middleware
      createRouteFile(tempDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.globalMiddleware = true
            next()
          }
        }
      `)

      // Users directory middleware
      const usersDir = createRouteDir(tempDir, 'users')
      createRouteFile(usersDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.usersMiddleware = true
            next()
          }
        }
      `)

      // Profile subdirectory middleware
      const profileDir = createRouteDir(usersDir, 'profile')
      createRouteFile(profileDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => {
            req.profileMiddleware = true
            next()
          }
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(Object.keys(dictionary).sort()).toEqual(['/api/', '/api/users/', '/api/users/profile/'])
      expect(dictionary['/api/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/users/'][0].fn).toBeInstanceOf(Function)
      expect(dictionary['/api/users/profile/'][0].fn).toBeInstanceOf(Function)
    })

    test('handles mixed priority and non-priority directories', async () => {
      // Priority middleware
      const authDir = createRouteDir(tempDir, '01-auth')
      createRouteFile(authDir, '_middleware.js', `
        module.exports = (options) => {
          return [{ fn: (req, res, next) => next(), priority: 10 }]
        }
      `)

      // Non-priority middleware
      const usersDir = createRouteDir(tempDir, 'users')
      createRouteFile(usersDir, '_middleware.js', `
        module.exports = (options) => {
          return (req, res, next) => next()
        }
      `)

      const dictionary = await buildMiddlewareDictionary(tempDir, '/api')

      expect(Object.keys(dictionary).sort()).toEqual(['/api/auth/', '/api/users/'])
      expect(dictionary['/api/auth/'][0].priority).toBe(10)
      expect(dictionary['/api/users/'][0].priority).toBe(50) // Default priority
    })
  })

  describe('Utility function tests', () => {
    describe('parseDirectoryPriority', () => {
      test('parses priority-prefixed directory names correctly', () => {
        const result = parseDirectoryPriority('10-users')
        expect(result).toEqual({
          priority: 10,
          name: 'users',
          hasPrefix: true,
          isDynamic: false
        })
      })

      test('parses priority-prefixed dynamic routes correctly', () => {
        const result = parseDirectoryPriority('05-[userId]')
        expect(result).toEqual({
          priority: 5,
          name: '[userId]',
          hasPrefix: true,
          isDynamic: true
        })
      })

      test('handles non-prefixed directories with default priority', () => {
        const result = parseDirectoryPriority('users')
        expect(result).toEqual({
          priority: 50,
          name: 'users',
          hasPrefix: false,
          isDynamic: false
        })
      })

      test('handles non-prefixed dynamic routes with default priority', () => {
        const result = parseDirectoryPriority('[sessionId]')
        expect(result).toEqual({
          priority: 50,
          name: '[sessionId]',
          hasPrefix: false,
          isDynamic: true
        })
      })
    })

    describe('normalizeMiddlewarePriority', () => {
      test('normalizes plain function to priority object', () => {
        const mockFn = jest.fn()
        const result = normalizeMiddlewarePriority(mockFn, 0, '/api/')

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
          fn: mockFn,
          priority: 50,
          sourceIndex: 0,
          sourcePath: '/api/'
        })
      })

      test('preserves priority objects', () => {
        const mockFn = jest.fn()
        const priorityObj = { fn: mockFn, priority: 20 }
        const result = normalizeMiddlewarePriority(priorityObj, 1, '/api/users/')

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
          fn: mockFn,
          priority: 20,
          sourceIndex: 1,
          sourcePath: '/api/users/'
        })
      })

      test('normalizes array of mixed types', () => {
        const mockFn1 = jest.fn()
        const mockFn2 = jest.fn()
        const mixedArray = [mockFn1, { fn: mockFn2, priority: 10 }]
        const result = normalizeMiddlewarePriority(mixedArray, 0, '/api/')

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
          fn: mockFn1,
          priority: 50,
          sourceIndex: 0,
          sourcePath: '/api/'
        })
        expect(result[1]).toEqual({
          fn: mockFn2,
          priority: 10,
          sourceIndex: 1,
          sourcePath: '/api/'
        })
      })
    })
  })
})
