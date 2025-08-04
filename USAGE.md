Lets make some assumptions, and then walk through what will happen.

1. your Routes should look something like this.

```
src/routes
├── closed
│   └── organizations
│       └── [organizationId]
│           ├── clients
│           │   └── [clientId]
│           │       ├── contracts
│           │       │   └── index.js
│           │       └── projects
│           │           └── index.js
│           └── departments
│               └── [departmentId]
│                   ├── employees
│                   │   ├── [employeeId]
│                   │   │   ├── projects
│                   │   │   │   └── index.js
│                   │   │   └── tasks
│                   │   │       └── index.js
│                   │   └── index.js
│                   └── subdepartments
│                       └── [subDepartmentId]
│                           └── employees
│                               ├── [employeeId]
│                               │   ├── projects
│                               │   │   └── index.js
│                               │   └── tasks
│                               │       └── index.js
│                               └── index.js
└── open
    ├── _middleware.js
    ├── blog-posts
    │   ├── [blogPostId]
    │   │   └── index.js
    │   ├── _middleware.js
    │   └── index.js
    └── users
        ├── [userId]
        │   ├── blog-posts
        │   │   ├── _middleware.js
        │   │   └── index.js
        │   ├── friends
        │   │   ├── [friendId]
        │   │   │   └── blog-posts
        │   │   │       ├── _middleware.js
        │   │   │       └── index.js
        │   │   └── index.js
        │   └── index.js
        └── index.js

```

This program will scan a directory structure and build URLs and Path Parameters based on the following rules:

- path parameters can only be a directory
- path parameters are identified as a bracket ( `[` ) followed by some text that can be a valid Express path parameter
  and then closed off by a closing bracket `]`
- there can only be two files in a single directory, an `index.js` or `_middleware.js`
- both of these javascript files, must return a function to be executed
  - `_middleware.js` accepts no parameters, however this is to allow you to perform Dependency Injection (DI) for the
    purpose of testing and isolation ( more on this later )
    - The middleware is hieratical by default, using Regular Expressions to do this, makes a system unnecessarily more
      complicated and impacts performance.
  - `index.js` accepts a Express Router and is expected to return that router with controllers ( and local middleware )
    attached to the router object.
    - while in the `index.js` you will not need to provide a path, the code will do that for you, it will even convert
      the path variables to Express Path variables.

2. An example `index.js`

A simple example without a local middleware

```javascript
const standard_controllers = (req, res, _next) => res.status(200).send({
  route: `${req.baseUrl}${req.route.path}`,
  params: req.params
})

module.exports = (router) => {
  router.get(standard_controllers)
  router.post(standard_controllers)
  router.put(standard_controllers)
  router.patch(standard_controllers)
  router.delete(standard_controllers)
  return router
}
```

Another simple example with localized middleware ( it will only apply to requests made into this path )

```javascript
const microMiddleware = (req, res, next) => {
  req.params = req.params || {};
  req.params.context = req.params.context || {};
  Object.assign(req.params.context, { microMiddleware: true })
  next()
}

const standard_controllers = (req, res, _next) => res.status(200).send({
  route: `${req.baseUrl}${req.route.path}`,
  params: req.params
})

module.exports = (router) => {
  router.get(microMiddleware, standard_controllers)
  router.post(microMiddleware, standard_controllers)
  router.put(microMiddleware, standard_controllers)
  router.patch(microMiddleware, standard_controllers)
  router.delete(microMiddleware, standard_controllers)
  return router
}

```

3. An example `_middleware.js`

A single middleware that will be applied to the current directory  ( end point ) and all subsequent paths.

```javascript
module.exports = () => {
  function standard_middleware(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    // Merge the context object with req.params.context
    Object.assign(req.params.context, { blogPost: true })
    next()
  }

  return standard_middleware
}

```

Multiple middleware, with importance on the order of execution, applied to the current directory ( end point ) and all
subsequent paths.

```javascript
module.exports = () => {
  function standard_middleware_must_go_first(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    // Merge the context object with req.params.context
    Object.assign(req.params.context, { first: true })
    next()
  }

  function standard_middleware_must_go_second(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    if (req.params.context.first) {
      Object.assign(req.params.context, { second: true })
      return next()
    }
    next(new Error('Missing required first execution of the middleware'))
  }

  return [
    standard_middleware_must_go_first,
    standard_middleware_must_go_second
  ]
}
```

4. At this point, you are ready to use it...

## CommonJS (CJS) Usage

Due to how Rollup exports the module, you need to access the `default` property when using CommonJS:

```javascript
const express = require('express')
const { join } = require('path')
// Note: Access .default due to Rollup export structure
const { composeRoutes } = require('@psenger/express-auto-router').default
const app = express()
const routeMappings = [
  {
    basePath: join(process.cwd(), 'src', 'routes', 'open'),
    baseURL: '/open'
  },
  {
    basePath: join(process.cwd(), 'src', 'routes', 'closed'),
    baseURL: '/closed'
  }
]
app.use('/api', composeRoutes(express, routeMappings))
module.exports = app
```

## ES Modules (ESM) Usage

For ES modules, you also need to access the `default` property:

```javascript
import express from 'express'
import { join } from 'path'
// Note: Access .default due to Rollup export structure
import module from '@psenger/express-auto-router'
const composeRoutes = module.default

const app = express()
const routeMappings = [
  {
    basePath: join(process.cwd(), 'src', 'routes', 'open'),
    baseURL: '/open'
  },
  {
    basePath: join(process.cwd(), 'src', 'routes', 'closed'),
    baseURL: '/closed'
  }
]
app.use('/api', composeRoutes(express, routeMappings))
export default app
```
