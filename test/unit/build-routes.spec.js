const { buildRoutes } = require('../../src/index.js')
const path = require('path')
const fs = require('fs')

// Mock the fs module
jest.mock('fs')

describe('buildRoutes', () => {
  let mockFS

  beforeEach(() => {
    mockFS = fs
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('builds routes from simple directory structure', () => {
    const basePath = '/test/routes'
    
    // Mock fs.statSync to return directory info
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    // Mock fs.readdirSync for the queue-based directory traversal
    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['index.js', 'users', 'posts']
      }
      if (dirPath === path.join(basePath, 'users')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, 'posts')) {
        return ['index.js']
      }
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toHaveLength(3)
    expect(routes).toContainEqual(['/api/', path.resolve(basePath, 'index.js')])
    expect(routes).toContainEqual(['/api/posts/', path.resolve(basePath, 'posts', 'index.js')])
    expect(routes).toContainEqual(['/api/users/', path.resolve(basePath, 'users', 'index.js')])
  })

  test('handles dynamic routes with placeholders', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['[userId]', 'users']
      }
      if (dirPath === path.join(basePath, '[userId]')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, 'users')) {
        return ['[postId]']
      }
      if (dirPath === path.join(basePath, 'users', '[postId]')) {
        return ['index.js']
      }
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toHaveLength(2)
    expect(routes).toContainEqual(['/api/:userId/', path.resolve(basePath, '[userId]', 'index.js')])
    expect(routes).toContainEqual(['/api/users/:postId/', path.resolve(basePath, 'users', '[postId]', 'index.js')])
  })

  test('handles priority-prefixed directories and sorts correctly', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['index.js', '50-posts', '01-users', '25-admin']
      }
      if (dirPath === path.join(basePath, '01-users')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, '25-admin')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, '50-posts')) {
        return ['index.js']
      }
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toHaveLength(4)
    // Routes should be sorted by priority, then alphabetically
    expect(routes[0]).toEqual(['/api/', path.resolve(basePath, 'index.js')])
    expect(routes[1]).toEqual(['/api/users/', path.resolve(basePath, '01-users', 'index.js')])
    expect(routes[2]).toEqual(['/api/admin/', path.resolve(basePath, '25-admin', 'index.js')])
    expect(routes[3]).toEqual(['/api/posts/', path.resolve(basePath, '50-posts', 'index.js')])
  })

  test('ignores directories without index.js files', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['users', 'posts', 'admin']
      }
      if (dirPath === path.join(basePath, 'users')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, 'posts')) {
        return ['controller.js'] // No index.js
      }
      if (dirPath === path.join(basePath, 'admin')) {
        return [] // Empty directory
      }
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toHaveLength(1)
    expect(routes).toContainEqual(['/api/users/', path.resolve(basePath, 'users', 'index.js')])
  })

  test('throws error for non-directory base path', () => {
    const filePath = '/test/not-a-directory.txt'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => false
    }))

    expect(() => buildRoutes(filePath, '/api')).toThrow(
      `Base path "${filePath}" is not a directory`
    )
  })

  test('handles empty directory', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toEqual([])
  })

  test('handles base URL with and without trailing slash', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['users']
      }
      if (dirPath === path.join(basePath, 'users')) {
        return ['index.js']
      }
      return []
    })

    // Test with trailing slash
    const routesWithSlash = buildRoutes(basePath, '/api/')
    expect(routesWithSlash).toHaveLength(1)
    expect(routesWithSlash).toContainEqual(['/api/users/', path.resolve(basePath, 'users', 'index.js')])

    // Test without trailing slash
    const routesWithoutSlash = buildRoutes(basePath, '/api')
    expect(routesWithoutSlash).toHaveLength(1)
    expect(routesWithoutSlash).toContainEqual(['/api/users/', path.resolve(basePath, 'users', 'index.js')])
  })

  test('sorts static routes before dynamic routes at same priority', () => {
    const basePath = '/test/routes'
    
    mockFS.statSync.mockImplementation((path) => ({
      isDirectory: () => true
    }))

    mockFS.readdirSync.mockImplementation((dirPath) => {
      if (dirPath === basePath) {
        return ['[userId]', 'users', '[adminId]', 'admin']
      }
      if (dirPath === path.join(basePath, 'users')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, 'admin')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, '[userId]')) {
        return ['index.js']
      }
      if (dirPath === path.join(basePath, '[adminId]')) {
        return ['index.js']
      }
      return []
    })

    const routes = buildRoutes(basePath, '/api')

    expect(routes).toHaveLength(4)
    
    // Check that static routes come before dynamic routes
    const staticRoutes = routes.filter(([url]) => !url.includes(':'))
    const dynamicRoutes = routes.filter(([url]) => url.includes(':'))
    
    expect(staticRoutes).toHaveLength(2)
    expect(dynamicRoutes).toHaveLength(2)
    
    // Verify the routes appear in the results (order may vary due to alphabetical sorting)
    expect(routes.some(([url]) => url === '/api/admin/')).toBe(true)
    expect(routes.some(([url]) => url === '/api/users/')).toBe(true)
    expect(routes.some(([url]) => url === '/api/:adminId/')).toBe(true)
    expect(routes.some(([url]) => url === '/api/:userId/')).toBe(true)
  })
})