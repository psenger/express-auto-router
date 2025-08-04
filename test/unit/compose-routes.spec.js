const { composeRoutes } = require('../../src/index.js')

describe('composeRoutes', () => {
  let mockExpress
  let mockRouter

  beforeEach(() => {
    // Mock Express router
    mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      options: jest.fn(),
      head: jest.fn(),
      all: jest.fn(),
      use: jest.fn(),
      stack: []
    }
    
    mockExpress = {
      Router: jest.fn(() => mockRouter)
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  test('validates route mappings and auto-converts to array', async () => {
    // String gets converted to array but then fails destructuring
    await expect(composeRoutes(mockExpress, 'invalid')).rejects.toThrow()
    
    // null/undefined will cause destructuring errors
    await expect(composeRoutes(mockExpress, null)).rejects.toThrow()
    await expect(composeRoutes(mockExpress, undefined)).rejects.toThrow()
    
    // Number gets converted to array but then fails destructuring
    await expect(composeRoutes(mockExpress, 123)).rejects.toThrow()
    
    // Empty object gets converted to array but has no basePath/baseURL
    await expect(composeRoutes(mockExpress, {})).rejects.toThrow()
  })

  test('validates basePath and baseURL', async () => {
    const invalidMappings1 = [{ basePath: '', baseURL: '/api' }]
    await expect(composeRoutes(mockExpress, invalidMappings1)).rejects.toThrow('Invalid path provided')

    const invalidMappings2 = [{ basePath: '/test', baseURL: '' }]
    await expect(composeRoutes(mockExpress, invalidMappings2)).rejects.toThrow('Invalid path provided')

    const invalidMappings3 = [{ basePath: null, baseURL: '/api' }]
    await expect(composeRoutes(mockExpress, invalidMappings3)).rejects.toThrow('Invalid path provided')

    const invalidMappings4 = [{ basePath: '/test', baseURL: null }]
    await expect(composeRoutes(mockExpress, invalidMappings4)).rejects.toThrow('Invalid path provided')
  })

  test('handles custom router options', async () => {
    const routeMappings = []
    const options = {
      routerOptions: { strict: false, caseSensitive: true }
    }

    await composeRoutes(mockExpress, routeMappings, options)

    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: false, caseSensitive: true })
  })

  test('handles default options when none provided', async () => {
    const routeMappings = []
    
    // Call without options parameter
    const result = await composeRoutes(mockExpress, routeMappings)

    expect(result).toBe(mockRouter)
    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
  })

  test('handles empty route mappings array', async () => {
    const result = await composeRoutes(mockExpress, [])

    expect(result).toBe(mockRouter)
    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
  })

  test('handles undefined options object properties', async () => {
    const routeMappings = []
    const options = {
      routerOptions: undefined,
      middlewareOptions: undefined,
      controllerOptions: undefined
    }

    const result = await composeRoutes(mockExpress, routeMappings, options)

    expect(result).toBe(mockRouter)
    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
  })

  test('handles partial options object', async () => {
    const routeMappings = []
    const options = {
      middlewareOptions: { auth: true }
      // Missing routerOptions and controllerOptions
    }

    const result = await composeRoutes(mockExpress, routeMappings, options)

    expect(result).toBe(mockRouter)
    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
  })

  test('creates router with default strict mode when routerOptions is null', async () => {
    const routeMappings = []
    const options = {
      routerOptions: null
    }

    const result = await composeRoutes(mockExpress, routeMappings, options)

    expect(result).toBe(mockRouter)
    expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
  })

  test('returns the created router instance', async () => {
    const routeMappings = []
    
    const result = await composeRoutes(mockExpress, routeMappings)

    expect(result).toBe(mockRouter)
    expect(typeof result).toBe('object')
  })

  test('calls Express.Router with provided options', async () => {
    const routeMappings = []
    const customOptions = { 
      strict: false, 
      caseSensitive: true, 
      mergeParams: true 
    }
    const options = {
      routerOptions: customOptions
    }

    await composeRoutes(mockExpress, routeMappings, options)

    expect(mockExpress.Router).toHaveBeenCalledTimes(1)
    expect(mockExpress.Router).toHaveBeenCalledWith(customOptions)
  })

  describe('main execution loop with unmocked fs', () => {
    test('executes main loop by unmocking fs temporarily', async () => {
      // Temporarily restore real fs operations
      jest.doMock('fs', () => jest.requireActual('fs'))
      jest.resetModules()
      
      // Re-require composeRoutes with real fs
      const { composeRoutes: realComposeRoutes } = require('../../src/index.js')
      
      // Create a simple temporary directory with route files for testing
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-test-'))
      
      try {
        // Create a simple route file
        fs.writeFileSync(path.join(tempDir, 'index.js'), `
          module.exports = (router) => {
            router.get((req, res) => res.json({ message: 'test' }))
            return router
          }
        `)

        // Create a users subdirectory with route
        const usersDir = path.join(tempDir, 'users')
        fs.mkdirSync(usersDir)
        fs.writeFileSync(path.join(usersDir, 'index.js'), `
          module.exports = (router) => {
            router.get((req, res) => res.json({ users: true }))
            return router
          }
        `)

        // Test with real filesystem
        const routeMappings = [{ basePath: tempDir, baseURL: '/api' }]
        const result = await realComposeRoutes(mockExpress, routeMappings)

        expect(result).toBe(mockRouter)
        expect(mockExpress.Router).toHaveBeenCalledWith({ strict: true })
        
      } finally {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
        
        // Restore mocked fs for other tests
        jest.resetModules()
        jest.clearAllMocks()
      }
    })

    test('handles controller validation errors', async () => {
      // Temporarily restore real fs operations
      jest.doMock('fs', () => jest.requireActual('fs'))
      jest.resetModules()
      
      // Re-require composeRoutes with real fs
      const { composeRoutes: realComposeRoutes } = require('../../src/index.js')
      
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-error-test-'))
      
      try {
        // Create a route file that doesn't export a function
        fs.writeFileSync(path.join(tempDir, 'index.js'), 'module.exports = "not a function"')

        const routeMappings = [{ basePath: tempDir, baseURL: '/api' }]
        
        await expect(realComposeRoutes(mockExpress, routeMappings)).rejects.toThrow(
          'must export a function'
        )
        
      } finally {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
        
        // Restore mocked fs for other tests
        jest.resetModules()
        jest.clearAllMocks()
      }
    })

    test('handles invalid router return errors', async () => {
      // Temporarily restore real fs operations
      jest.doMock('fs', () => jest.requireActual('fs'))
      jest.resetModules()
      
      // Re-require composeRoutes with real fs
      const { composeRoutes: realComposeRoutes } = require('../../src/index.js')
      
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-router-error-test-'))
      
      try {
        // Create a route file that returns invalid router
        fs.writeFileSync(path.join(tempDir, 'index.js'), `
          module.exports = (router) => {
            return "not a router"
          }
        `)

        const routeMappings = [{ basePath: tempDir, baseURL: '/api' }]
        
        await expect(realComposeRoutes(mockExpress, routeMappings)).rejects.toThrow(
          'did not return a valid router'
        )
        
      } finally {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
        
        // Restore mocked fs for other tests
        jest.resetModules()
        jest.clearAllMocks()
      }
    })

    test('handles placeholder directories and middleware loading', async () => {
      // Temporarily restore real fs operations
      jest.doMock('fs', () => jest.requireActual('fs'))
      jest.resetModules()
      
      // Re-require composeRoutes with real fs
      const { composeRoutes: realComposeRoutes } = require('../../src/index.js')
      
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-placeholder-test-'))
      
      try {
        // Create middleware in root
        fs.writeFileSync(path.join(tempDir, '_middleware.js'), `
          module.exports = () => [(req, res, next) => {
            req.rootMiddleware = true
            next()
          }]
        `)

        // Create users directory with middleware
        const usersDir = path.join(tempDir, 'users')
        fs.mkdirSync(usersDir)
        fs.writeFileSync(path.join(usersDir, '_middleware.js'), `
          module.exports = () => [(req, res, next) => {
            req.usersMiddleware = true
            next()
          }]
        `)

        // Create placeholder directory [userId] with middleware and route
        const userIdDir = path.join(usersDir, '[userId]')
        fs.mkdirSync(userIdDir)
        fs.writeFileSync(path.join(userIdDir, '_middleware.js'), `
          module.exports = () => [(req, res, next) => {
            req.userIdMiddleware = true
            next()
          }]
        `)
        fs.writeFileSync(path.join(userIdDir, 'index.js'), `
          module.exports = (router) => {
            router.get((req, res) => res.json({ 
              userId: req.params.userId,
              middleware: {
                root: req.rootMiddleware,
                users: req.usersMiddleware,
                userId: req.userIdMiddleware
              }
            }))
            return router
          }
        `)

        const routeMappings = [{ basePath: tempDir, baseURL: '/api' }]
        const result = await realComposeRoutes(mockExpress, routeMappings)

        expect(result).toBe(mockRouter)
        
      } finally {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
        
        // Restore mocked fs for other tests
        jest.resetModules()
        jest.clearAllMocks()
      }
    })

    test('handles middleware loading errors', async () => {
      // Temporarily restore real fs operations
      jest.doMock('fs', () => jest.requireActual('fs'))
      jest.resetModules()
      
      // Re-require composeRoutes with real fs
      const { composeRoutes: realComposeRoutes } = require('../../src/index.js')
      
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-middleware-error-test-'))
      
      try {
        // Create middleware that doesn't export proper function
        fs.writeFileSync(path.join(tempDir, '_middleware.js'), `
          module.exports = () => "not valid middleware"
        `)

        // Create a route file
        fs.writeFileSync(path.join(tempDir, 'index.js'), `
          module.exports = (router) => {
            router.get((req, res) => res.json({}))
            return router
          }
        `)

        const routeMappings = [{ basePath: tempDir, baseURL: '/api' }]
        
        await expect(realComposeRoutes(mockExpress, routeMappings)).rejects.toThrow(
          'must export a function or array of functions'
        )
        
      } finally {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
        
        // Restore mocked fs for other tests
        jest.resetModules()
        jest.clearAllMocks()
      }
    })
  })
})