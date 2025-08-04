const { curryObjectMethods } = require('../../src/index.js')

describe('curryObjectMethods', () => {
  test('curries router methods with path and middleware', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn()
    }
    
    const middleware1 = (req, res, next) => next()
    const middleware2 = (req, res, next) => next()
    
    const curried = curryObjectMethods(mockRouter, '/api/users', middleware1, middleware2)
    
    const handler = (req, res) => res.json({})
    curried.get(handler)
    
    expect(mockRouter.get).toHaveBeenCalledWith('/api/users', middleware1, middleware2, handler)
  })

  test('preserves non-HTTP method properties', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn(),
      stack: []
    }
    
    const curried = curryObjectMethods(mockRouter, '/api', (req, res, next) => next())
    
    expect(curried.use).toBe(mockRouter.use)
    expect(curried.stack).toBe(mockRouter.stack)
  })

  test('provides access to original router', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn()
    }
    
    const curried = curryObjectMethods(mockRouter, '/api')
    expect(curried._getOriginalObject()).toBe(mockRouter)
  })

  test('handles router with custom properties', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      customProp: 'value'
    }
    
    const curried = curryObjectMethods(mockRouter, '/api')
    expect(curried.customProp).toBe('value')
  })

  test('curries multiple HTTP methods', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }
    
    const middleware = (req, res, next) => next()
    const curried = curryObjectMethods(mockRouter, '/api/users', middleware)
    
    const getHandler = (req, res) => res.json({})
    const postHandler = (req, res) => res.status(201).json({})
    
    curried.get(getHandler)
    curried.post(postHandler)
    
    expect(mockRouter.get).toHaveBeenCalledWith('/api/users', middleware, getHandler)
    expect(mockRouter.post).toHaveBeenCalledWith('/api/users', middleware, postHandler)
  })

  test('handles router methods that return values', () => {
    const mockRouter = {
      get: jest.fn().mockReturnValue('route-registered'),
      post: jest.fn().mockReturnValue('post-route-registered')
    }
    
    const curried = curryObjectMethods(mockRouter, '/api/test')
    
    const handler = (req, res) => res.json({})
    const result = curried.get(handler)
    
    expect(result).toBe('route-registered')
    expect(mockRouter.get).toHaveBeenCalledWith('/api/test', handler)
  })
})