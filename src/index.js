import path from 'path'
import { readdirSync, statSync } from 'fs'

const PLACEHOLDER_REGEX = /\[(.+?)\]/
const PLACEHOLDER_GLOBAL_REGEX = /\[(.+?)\]/g

/**
 * Checks if a directory entry is a middleware file
 *
 * @param {Object} entry - The directory entry to check (fs.Dirent object)
 * @returns {boolean} - True if the entry is a file named '_middleware.js'
 *
 * @example
 * // With a file entry for '_middleware.js'
 * const middlewareEntry = { isFile: () => true, name: '_middleware.js' };
 * isMiddlewareFile(middlewareEntry); // Returns: true
 *
 * @example
 * // With a directory entry
 * const dirEntry = { isFile: () => false, name: '_middleware.js' };
 * isMiddlewareFile(dirEntry); // Returns: false
 *
 * @example
 * // With a different file
 * const otherFileEntry = { isFile: () => true, name: 'index.js' };
 * isMiddlewareFile(otherFileEntry); // Returns: false
 */
export function isMiddlewareFile(entry) {
  return entry.isFile() && entry.name === '_middleware.js'
}

/**
 * Ensures a value is always an array by wrapping non-array values
 *
 * @param {*} ary - The value to convert to an array
 * @returns {Array} - Wraps the value in an array, or if the input was an array already it will return it as is.
 *
 * @example
 * // With a non-array value
 * autoBox(5); // Returns: [5]
 *
 * @example
 * // With an array value
 * autoBox([1, 2, 3]); // Returns: [1, 2, 3]
 *
 * @example
 * // With null or undefined
 * autoBox(null); // Returns: [null]
 * autoBox(undefined); // Returns: [undefined]
 *
 * @example
 * // With an object
 * autoBox({ key: 'value' }); // Returns: [{ key: 'value' }]
 */
export function autoBox(ary) {
  return Array.isArray(ary) ? ary : [ary]
}

/**
 * Converts URL placeholder syntax [param] to Express parameter syntax :param
 *
 * @param {string} urlPath - The URL path containing placeholders
 * @returns {string} - The URL path with Express-style parameters
 *
 * @example
 * // With single placeholder
 * replaceUrlPlaceholders('/users/[id]'); // Returns: '/users/:id'
 *
 * @example
 * // With multiple placeholders
 * replaceUrlPlaceholders('/users/[id]/posts/[postId]'); // Returns: '/users/:id/posts/:postId'
 *
 * @example
 * // With no placeholders
 * replaceUrlPlaceholders('/users/list'); // Returns: '/users/list'
 *
 * @example
 * // With nested/complex placeholders
 * replaceUrlPlaceholders('/products/[category]/[id]/reviews/[reviewId]');
 * // Returns: '/products/:category/:id/reviews/:reviewId'
 */
export function replaceUrlPlaceholders(urlPath) {
  return urlPath.replace(
    PLACEHOLDER_GLOBAL_REGEX,
    (match, variable) => `:${variable}`
  )
}

/**
 * Checks if a URL path contains a placeholder
 *
 * @param {string} urlPath - The URL path to check
 * @returns {boolean} - True if the path contains a placeholder
 *
 * @example
 * // With placeholder
 * isPlaceholder('/users/[id]'); // Returns: true
 *
 * @example
 * // With multiple placeholders
 * isPlaceholder('/users/[id]/posts/[postId]'); // Returns: true
 *
 * @example
 * // Without placeholder
 * isPlaceholder('/users/list'); // Returns: false
 *
 * @example
 * // With square brackets in a different context (not a placeholder)
 * isPlaceholder('/users/list[all]'); // Returns: true (matches the regex pattern)
 */
export function isPlaceholder(urlPath) {
  return PLACEHOLDER_REGEX.test(urlPath)
}

/**
 * Validates if a path is a non-empty string
 *
 * @param {string} path - The path to validate
 * @throws {Error} If path is not a string or is empty
 *
 * @example
 * // With valid path
 * validatePath('/api/users'); // No error thrown
 *
 * @example
 * // With empty string
 * try {
 *   validatePath('');
 * } catch (error) {
 *   console.error(error.message); // Outputs: 'Invalid path provided'
 * }
 *
 * @example
 * // With null value
 * try {
 *   validatePath(null);
 * } catch (error) {
 *   console.error(error.message); // Outputs: 'Invalid path provided'
 * }
 *
 * @example
 * // With non-string value
 * try {
 *   validatePath(123);
 * } catch (error) {
 *   console.error(error.message); // Outputs: 'Invalid path provided'
 * }
 */
export function validatePath(path) {
  if (typeof path !== 'string' || !path) {
    throw new Error('Invalid path provided')
  }
}

/**
 * Retrieves and sorts middleware functions that match a given path
 * Finds all entries in the dictionary where the given path starts with the dictionary key,
 * sorts them by key length (shortest first), and returns the flattened array of middleware functions
 *
 * @param {Object<string, Function|Array<Function>>} dictionary - Dictionary of paths to middleware functions
 * @param {string} path - The path to match
 * @returns {Array<Function>} - Array of middleware functions that apply to the path, ordered by path specificity
 *
 * @example
 * // With matching paths
 * const dict = {
 *   '/api/': [authMiddleware],
 *   '/api/users/': [userMiddleware]
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/profile');
 * // Returns: [authMiddleware, userMiddleware] (in order from least to most specific)
 *
 * @example
 * // With no matching paths
 * const dict = {
 *   '/api/': [authMiddleware],
 *   '/api/users/': [userMiddleware]
 * };
 * dictionaryKeyStartsWithPath(dict, '/admin/');
 * // Returns: []
 *
 * @example
 * // With mixed array and single function values
 * const dict = {
 *   '/api/': [authMiddleware, logMiddleware],
 *   '/api/users/': userMiddleware
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/');
 * // Returns: [authMiddleware, logMiddleware, userMiddleware]
 *
 * @example
 * // With null or undefined values in the dictionary (they are filtered out)
 * const dict = {
 *   '/api/': [authMiddleware, null],
 *   '/api/users/': undefined
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/');
 * // Returns: [authMiddleware]
 */
export function dictionaryKeyStartsWithPath(dictionary, path) {
  return Object.entries(dictionary)
    .filter(([key]) => path.startsWith(key))
    .sort(([aKey], [bKey]) => aKey.length - bKey.length)
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
}

/**
 * Creates a curried router object with pre-configured URL path and middleware
 * Returns a proxy to the original router that applies the given URL path and middleware functions
 * to all HTTP method calls (get, post, put, etc.) automatically
 *
 * @param {Object} router - Express router instance
 * @param {string} urlPath - The URL path to be curried
 * @param {...Function} initialMiddleWareFunctions - Initial middleware functions to be applied (rest parameter, accepts multiple functions)
 * @returns {Object} - Curried router proxy with pre-configured path and middleware
 *
 * @example
 * // Basic usage with a single middleware function
 * const router = express.Router();
 * const curriedRouter = curryObjectMethods(router, '/users', authMiddleware);
 * curriedRouter.get((req, res) => res.json({}));
 * // Equivalent to: router.get('/users', authMiddleware, (req, res) => res.json({}));
 *
 * @example
 * // With multiple middleware functions
 * const curriedRouter = curryObjectMethods(router, '/posts', authMiddleware, logMiddleware);
 * curriedRouter.post((req, res) => res.status(201).json({}));
 * // Equivalent to: router.post('/posts', authMiddleware, logMiddleware, (req, res) => res.status(201).json({}));
 *
 * @example
 * // With no middleware
 * const curriedRouter = curryObjectMethods(router, '/public');
 * curriedRouter.get((req, res) => res.send('Hello'));
 * // Equivalent to: router.get('/public', (req, res) => res.send('Hello'));
 *
 * @example
 * // Accessing the original router object
 * const curriedRouter = curryObjectMethods(router, '/api');
 * const originalRouter = curriedRouter._getOriginalObject();
 * // originalRouter is the router instance passed in the first parameter
 */
export function curryObjectMethods(
  router,
  urlPath,
  ...initialMiddleWareFunctions
) {
  const originalRouter = router
  const handler = {
    get(target, prop) {
      const originalHttpMethod = target[prop]
      if (typeof originalHttpMethod === 'function') {
        return (...remainingFns) => {
          const allFns = [...initialMiddleWareFunctions, ...remainingFns]
          return originalHttpMethod.call(target, urlPath, ...allFns)
        }
      }
      return originalHttpMethod
    }
  }
  const curriedRouterObject = new Proxy(router, handler)
  curriedRouterObject._getOriginalObject = () => originalRouter
  return curriedRouterObject
}

/**
 * Builds a dictionary of middleware functions from a directory structure
 * Recursively scans the given directory for '_middleware.js' files and builds a dictionary
 * mapping URL paths to their corresponding middleware functions
 *
 * @param {string} basePath - Base filesystem path to start scanning
 * @param {string} baseURL - Base URL path for the routes
 * @param {Object} [options=undefined] - Options that can be passed to all controllers when they are executed.
 * @returns {Object<string, Array<Function>>} Dictionary where keys are URL paths and values are arrays of middleware functions
 *
 * @example
 * // Basic directory structure with middleware
 * // ./src/routes/_middleware.js         -> exports a global middleware
 * // ./src/routes/users/_middleware.js   -> exports a users-specific middleware
 * const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
 * // Returns: {
 * //   '/api/': [globalMiddleware],
 * //   '/api/users/': [usersMiddleware]
 * // }
 *
 * @example
 * // With dynamic route parameters
 * // ./src/routes/users/[id]/_middleware.js  -> exports a user-specific middleware
 * const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
 * // Returns: {
 * //   '/api/': [globalMiddleware],
 * //   '/api/users/': [usersMiddleware],
 * //   '/api/users/:id/': [userSpecificMiddleware]
 * // }
 *
 * @example
 * // With middleware exporting multiple functions
 * // ./src/routes/_middleware.js  -> exports [authMiddleware, logMiddleware]
 * const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
 * // Returns: {
 * //   '/api/': [authMiddleware, logMiddleware]
 * // }
 *
 * @example
 * // With middleware exporting a single function
 * // ./src/routes/_middleware.js  -> exports singleMiddleware (not in an array)
 * const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
 * // Returns: {
 * //   '/api/': [singleMiddleware]
 * // }
 */
export function buildMiddlewareDictionary(basePath, baseURL, options) {
  const dictionary = {}
  const traverseDirectory = (currentPath, currentURL) => {
    const dirEntries = readdirSync(currentPath, { withFileTypes: true })
    dirEntries.forEach((entry) => {
      const entryPath = path.join(currentPath, entry.name)
      let entryURL = `${currentURL}/${entry.name}`
      if (entry.isDirectory()) {
        const match = entry.name.match(/\[(.+?)\]/)
        if (match) {
          const pathVariable = `:${match[1]}`
          entryURL = `${currentURL}/${entry.name.replace(/\[(.+?)\]/, pathVariable)}`
        }
        traverseDirectory(entryPath, entryURL)
      } else if (isMiddlewareFile(entry)) {
        try {
          const middleware = require(entryPath)(options)
          const middlewareURL = entryURL.replace('_middleware.js', '')
          dictionary[middlewareURL] = autoBox(middleware)
        } catch (e) {
          console.error(e)
          console.error(`Failed to load ${entryPath}`)
        }
      }
    })
  }
  traverseDirectory(basePath, baseURL)
  return dictionary
}

/**
 * Builds an array of route mappings from a directory structure
 * Recursively scans the given directory for 'index.js' files and builds an array of
 * URL paths and their corresponding file paths, converting directory placeholders to Express params
 *
 * @param {string} basePath - Base filesystem path to start scanning
 * @param {string} baseURL - Base URL path for the routes
 * @returns {Array<Array<string>>} Array of tuples where first element is URL path and second is file path
 *
 * @example
 * // Basic directory structure
 * // ./src/routes/users/index.js
 * // ./src/routes/posts/index.js
 * const routes = buildRoutes('./src/routes', '/api');
 * // Returns: [
 * //   ['/api/users/', './src/routes/users/index.js'],
 * //   ['/api/posts/', './src/routes/posts/index.js']
 * // ]
 *
 * @example
 * // With dynamic route parameters
 * // ./src/routes/users/[id]/index.js
 * const routes = buildRoutes('./src/routes', '/api');
 * // Returns: [
 * //   ['/api/users/:id/', './src/routes/users/[id]/index.js']
 * // ]
 *
 * @example
 * // With nested dynamic routes
 * // ./src/routes/users/[userId]/posts/[postId]/index.js
 * const routes = buildRoutes('./src/routes', '/api');
 * // Returns: [
 * //   ['/api/users/:userId/posts/:postId/', './src/routes/users/[userId]/posts/[postId]/index.js']
 * // ]
 *
 * @example
 * // With root route
 * // ./src/routes/index.js
 * const routes = buildRoutes('./src/routes', '/api');
 * // Returns: [
 * //   ['/api/', './src/routes/index.js']
 * // ]
 */
export function buildRoutes(basePath, baseURL) {
  const result = []
  const queue = [[basePath, baseURL + '/']]
  while (queue.length > 0) {
    const [currentPath, currentURL] = queue.shift()
    const files = readdirSync(currentPath)
    const indexFile = files.find((file) => file === 'index.js')
    if (indexFile) {
      const indexFilePath = path.join(currentPath, indexFile)
      result.push([currentURL, indexFilePath])
    }
    const directories = files
      .filter((file) => statSync(path.join(currentPath, file)).isDirectory())
      .map((dir) => path.join(currentPath, dir))
    directories.forEach((dir) => {
      const dirName = path.basename(dir)
      let entryURL = `${currentURL}${dirName}/`
      if (isPlaceholder(dirName)) {
        entryURL = `${currentURL}${replaceUrlPlaceholders(dirName)}/`
      }
      queue.push([dir, entryURL])
    })
  }
  return result
}

/**
 * Composes Express routes from a directory structure with middleware support.
 * This is the main function that processes route mappings, builds middleware dictionaries,
 * and configures an Express router with all discovered routes and middleware.
 *
 * @param {Object} express - The Express module instance
 * @param {Array<Object>} routeMappings - Array of route mapping configurations
 * @param {string} routeMappings[].basePath - Base filesystem path to start scanning
 * @param {string} routeMappings[].baseURL - Base URL path for the routes
 * @param {Object} [options] - Configuration options
 * @param {Object} [options.routerOptions] - Options for the Express router (default: `{ strict: true }` stay with this for best results but be advised it makes paths require to be terminated with `/` )
 * @param {Object} [options.middlewareOptions=undefined] - Options passed to every middleware.
 * @param {Object} [options.controllerOptions=undefined] - Options passed to every controller.
 * @returns {Object} Configured Express router with applied routes
 *
 * @example
 * // Basic usage with a single route mapping
 * const express = require('express');
 * const app = express();
 *
 * const router = composeRoutes(express, [
 *   {
 *     basePath: './src/routes',
 *     baseURL: '/api'
 *   }
 * ]);
 *
 * app.use(router);
 * // This will set up all routes found in './src/routes' with their middleware
 *
 * @example
 * // With multiple route mappings
 * const router = composeRoutes(express, [
 *   {
 *     basePath: './src/api/routes',
 *     baseURL: '/api'
 *   },
 *   {
 *     basePath: './src/admin/routes',
 *     baseURL: '/admin'
 *   }
 * ]);
 *
 * @example
 * // With custom router options
 * const router = composeRoutes(express, [
 *   {
 *     basePath: './src/routes',
 *     baseURL: '/api'
 *   }
 * ], {
 *   routerOptions: {
 *     strict: true,
 *   }
 * });
 *
 * @example
 * // With an existing router instance
 * const existingRouter = express.Router();
 * const router = composeRoutes(express, [
 *   {
 *     basePath: './src/routes',
 *     baseURL: '/api'
 *   }
 * ], {
 *   router: existingRouter
 * });
 */
const composeRoutes = (
  express,
  routeMappings,
  options = { routerOptions: { strict: true }, middlewareOptions: undefined, controllerOptions: undefined }
) => {
  if (!Array.isArray(routeMappings)) {
    throw new Error('Route mappings must be an array')
  }
  const routerOptions = options.routerOptions || { strict: true }
  const middlewareOptions = options.middlewareOptions || undefined
  const controllerOptions = options.controllerOptions || undefined
  const router = express.Router(routerOptions)
  return routeMappings.reduce((router, { basePath, baseURL }) => {
    validatePath(basePath)
    validatePath(baseURL)
    const middlewareFunctionDictionary = buildMiddlewareDictionary(
      basePath,
      baseURL,
      middlewareOptions
    )
    const routes = buildRoutes(basePath, baseURL)
    routes.map(([url, filepath]) => {
      // curry the Router, so that the URL is set to the route, and the Middleware is loaded.
      let curriedRouter = curryObjectMethods(
        router,
        url,
        ...dictionaryKeyStartsWithPath(middlewareFunctionDictionary, url)
      )
      const controllers = require(filepath)
      curriedRouter = controllers(curriedRouter, controllerOptions)
      router = curriedRouter._getOriginalObject()
    })
    return router
  }, router)
}
export default composeRoutes
