import request from 'supertest'
import express from 'express'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import lib from '../../dist/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const { composeRoutes } = lib

// Initialize both apps at lib level to avoid Jest teardown issues
const backwardApp = express()
const forwardApp = express()

const backwardBaseDir = join(__dirname, 'backward-compatibility', 'routes')
const backwardRouteMappings = [
  {
    basePath: backwardBaseDir,
    baseURL: '/'
  }
]

const forwardBaseDir = join(__dirname, 'version-1.0.0', 'routes')
const forwardRouteMappings = [
  {
    basePath: forwardBaseDir,
    baseURL: '/'
  }
]

const backwardRouter = await composeRoutes(express, backwardRouteMappings, { middlewareOptions: {}, controllerOptions: {} })
const forwardRouter = await composeRoutes(express, forwardRouteMappings, { middlewareOptions: {}, controllerOptions: {} })

backwardApp.use(backwardRouter)
forwardApp.use(forwardRouter)

describe('Integration Tests', () => {

  /**
   * Due to the fact that I cant teardown the environment correctly between tests.
   * I had to combine backward and forward tests in one test.
   */

  describe('Backward Compatibility Integration Tests', () => {
    describe('Comprehensive Route and HTTP Method Testing for Middleware Priority', () => {
      const routes = [
        '/api/posts/',
        '/api/posts/10/',
        '/api/users/admin/',
        '/api/users/all/',
        '/api/users/',
        '/api/users/10/'
      ]

      const httpMethods = ['get', 'post', 'put', 'patch', 'delete']

      test.each(
        routes.flatMap(route =>
          httpMethods.map(method => [method, route])
        )
      )('should return status 200 for %s %s', async (method, route) => {
        const response = await request(backwardApp)[method](route)

        expect(response.status).toBe(200)
        expect(response.body.method).toBe(method)
        expect(response.body.route).toBeDefined()
        expect(response.body.params).toBeDefined()
        expect(response.body.middleware).toBeDefined()

        expect(response.body).toMatchSnapshot()
      })
    })
  })

  describe('Forward Compatibility Integration Tests (Priority Directory Names)', () => {
    describe('Comprehensive Route and HTTP Method Testing for Middleware Priority', () => {
      const routes = [
        '/beta/',
        '/alpha/',
        '/charlie/',
        '/zulu/',
        '/api/users/10/',
        '/api/users/',
        '/api/users/10/',
        '/api/users/all/',
        '/api/users/admin/',
        '/api/users/profile/'
      ]

      const httpMethods = ['get', 'post', 'put', 'patch', 'delete']

      test.each(
        routes.flatMap(route =>
          httpMethods.map(method => [method, route])
        )
      )('should return status 200 for %s %s', async (method, route) => {
        const response = await request(forwardApp)[method](route)

        expect(response.status).toBe(200)
        expect(response.body.method).toBe(method)
        expect(response.body.route).toBeDefined()
        expect(response.body.params).toBeDefined()
        expect(response.body.middleware).toBeDefined()

        expect(response.body).toMatchSnapshot()
      })
    })
  })
})
