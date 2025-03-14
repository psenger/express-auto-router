const express = require('express')
const { join } = require('path')
const composeRoutes = require('../dist/index').default
const app = express()
const routeMappings = [
  {
    basePath: join(process.cwd(), 'test', 'routes', 'open'),
    baseURL: '/open'
  },
  {
    basePath: join(process.cwd(), 'test', 'routes', 'closed'),
    baseURL: '/closed'
  }
]
app.use('/api', composeRoutes(express, routeMappings))
module.exports = app
