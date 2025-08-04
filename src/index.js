const path = require('path')
const { readdirSync, statSync } = require('fs')

/**
 * Universal module loader that handles both CommonJS and ESM modules
 * Tries CommonJS first, falls back to dynamic import for ESM
 *
 * @param {string} modulePath - Path to the module to load
 * @returns {Promise<any>|any} - The loaded module
 */
// function loadModule(modulePath) {
//   try {
//     // Try CommonJS first (synchronous)
//     return require(modulePath)
//   } catch (requireError) {
//     // If require fails, try dynamic import (asynchronous)
//     try {
//       // Use Function constructor to avoid static analysis issues
//       const dynamicImport = new Function('modulePath', 'return import(modulePath)')
//       return dynamicImport(modulePath).then(module => module.default || module)
//     } catch (importError) {
//       // If both fail, throw the original require error
//       throw requireError
//     }
//   }
// }
function loadModule(modulePath) {
  // Check if we're in a CommonJS environment (require is available)
  if (typeof require !== 'undefined') {
    try {
      // Try CommonJS first (synchronous)
      return require(modulePath)
    } catch (requireError) {
      // If require fails (e.g., ESM module), fall back to dynamic import
      try {
        const dynamicImport = new Function(
          'modulePath',
          'return import(modulePath)'
        )
        return dynamicImport(modulePath).then((module) => {
          // Handle both default and named exports properly
          if (module.default !== undefined) {
            return module.default
          }
          return module
        })
      } catch (importError) {
        console.warn('Dynamic import failed:', importError)
        requireError.cause = importError
        throw requireError
      }
    }
  } else {
    // We're in an ESM environment, use dynamic import directly
    try {
      const dynamicImport = new Function(
        'modulePath',
        'return import(modulePath)'
      )
      return dynamicImport(modulePath).then((module) => {
        // Handle both default and named exports properly
        if (module.default !== undefined) {
          return module.default
        }
        return module
      })
    } catch (importError) {
      console.warn('Dynamic import failed:', importError)
      throw importError
    }
  }
}

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
function isMiddlewareFile(entry) {
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
function autoBox(ary) {
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
function replaceUrlPlaceholders(urlPath) {
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
function isPlaceholder(urlPath) {
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
function validatePath(path) {
  if (typeof path !== 'string' || !path) {
    throw new Error('Invalid path provided')
  }
}

/**
 * Safely joins URL paths without creating double slashes
 * Removes trailing slash from base and ensures segment starts with slash
 *
 * @param {string} base - The base URL path
 * @param {string} segment - The path segment to append
 * @returns {string} - The joined path without double slashes
 *
 * @example
 * // With base having trailing slash
 * joinUrlPaths('/api/', 'users')
 * // Returns: '/api/users'
 *
 * @example
 * // With base not having trailing slash
 * joinUrlPaths('/api', 'users')
 * // Returns: '/api/users'
 *
 * @example
 * // With segment having leading slash
 * joinUrlPaths('/api', '/users')
 * // Returns: '/api/users'
 *
 * @example
 * // Preventing double slashes
 * joinUrlPaths('/api/', '/users')
 * // Returns: '/api/users'
 *
 * @example
 * // With empty base (edge case)
 * joinUrlPaths('', 'users')
 * // Returns: '/users'
 *
 * @example
 * // With empty segment (edge case)
 * joinUrlPaths('/api', '')
 * // Returns: '/api/'
 *
 * @example
 * // With both empty (edge case)
 * joinUrlPaths('', '')
 * // Returns: '/'
 */
function joinUrlPaths(base, segment) {
  // Remove trailing slash from base if it exists
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  // Ensure segment starts with /
  const cleanSegment = segment.startsWith('/') ? segment : '/' + segment
  return cleanBase + cleanSegment
}

/**
 * Parses directory name for priority prefix, extracts route name, and detects route type
 *
 * @param {string} dirName - Directory name (e.g., "10-users", "users", "05-[id]", "[sessionId]")
 * @returns {Object} - { priority: number, name: string, hasPrefix: boolean, isDynamic: boolean }
 *
 * @example
 * // With priority prefix and static route
 * parseDirectoryPriority("10-users")
 * // Returns: { priority: 10, name: "users", hasPrefix: true, isDynamic: false }
 *
 * @example
 * // With priority prefix and dynamic route
 * parseDirectoryPriority("05-[userId]")
 * // Returns: { priority: 5, name: "[userId]", hasPrefix: true, isDynamic: true }
 *
 * @example
 * // Without priority prefix (static route)
 * parseDirectoryPriority("users")
 * // Returns: { priority: 50, name: "users", hasPrefix: false, isDynamic: false }
 *
 * @example
 * // Without priority prefix (dynamic route)
 * parseDirectoryPriority("[sessionId]")
 * // Returns: { priority: 50, name: "[sessionId]", hasPrefix: false, isDynamic: true }
 *
 * @example
 * // Invalid priority range (falls back to default)
 * parseDirectoryPriority("150-invalid")
 * // Logs: "Invalid priority prefix detected in directory "150-invalid", using default priority 50"
 * // Returns: { priority: 50, name: "150-invalid", hasPrefix: false, isDynamic: false }
 *
 * @example
 * // Invalid priority format (falls back to default)
 * parseDirectoryPriority("x5-invalid")
 * // Returns: { priority: 50, name: "x5-invalid", hasPrefix: false, isDynamic: false }
 *
 * @note Logs warning message to console.info when invalid priority prefix is detected (out of 00-99 range)
 * @note Valid priority range is 00-99; invalid ranges default to priority 50 with hasPrefix: false
 */
function parseDirectoryPriority(dirName) {
  const match = dirName.match(/^(\d{2})-(.+)$/)
  if (match) {
    const priority = parseInt(match[1], 10)
    const name = match[2]
    if (priority >= 0 && priority <= 99) {
      return {
        priority,
        name,
        hasPrefix: true,
        isDynamic: isPlaceholder(name)
      }
    }
    console.info(
      `Invalid priority prefix detected in directory "${dirName}", using default priority 50`
    )
  }
  return {
    priority: 50, // Default middle priority for non-prefixed directories
    name: dirName,
    hasPrefix: false,
    isDynamic: isPlaceholder(dirName)
  }
}

/**
 * Normalizes middleware to priority objects with consistent structure
 *
 * @param {Function|Object|Array} middleware - Middleware function(s) or priority objects
 * @param {number} sourceIndex - Original array position for tracking
 * @param {string} sourcePath - Source path for specificity tracking
 * @returns {Array} Array of {fn, priority, sourceIndex, sourcePath} objects
 *
 * @example
 * // With plain function
 * normalizeMiddlewarePriority(corsMiddleware, 0, '/api/')
 * // Returns: [{ fn: corsMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/api/' }]
 *
 * @example
 * // With priority object
 * normalizeMiddlewarePriority({ fn: authMiddleware, priority: 10 }, 1, '/api/')
 * // Returns: [{ fn: authMiddleware, priority: 10, sourceIndex: 1, sourcePath: '/api/' }]
 *
 * @example
 * // With array of mixed types
 * normalizeMiddlewarePriority([corsMiddleware, { fn: authMiddleware, priority: 20 }], 0, '/api/')
 * // Returns: [
 * //   { fn: corsMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/api/' },
 * //   { fn: authMiddleware, priority: 20, sourceIndex: 1, sourcePath: '/api/' }
 * // ]
 */
function normalizeMiddlewarePriority(
  middleware,
  sourceIndex = 0,
  sourcePath = ''
) {
  const items = Array.isArray(middleware) ? middleware : [middleware]
  return items.map((item, index) => {
    if (typeof item === 'function') {
      return {
        fn: item,
        priority: 50,
        sourceIndex: sourceIndex + index,
        sourcePath
      }
    }
    if (item && typeof item.fn === 'function') {
      return {
        fn: item.fn,
        priority: item.priority || 50,
        sourceIndex: sourceIndex + index,
        sourcePath
      }
    }
    throw new Error(
      'Invalid middleware: must be function or {fn, priority} object'
    )
  })
}

/**
 * Sorts and flattens middleware functions by four-level priority system
 *
 * @param {Array} middlewareArray - Array of {fn, priority, sourceIndex, sourcePath} objects
 * @returns {Array} Array of middleware functions sorted by priority
 *
 * @example
 * // With mixed priority middleware
 * const middleware = [
 *   { fn: authMiddleware, priority: 20, sourceIndex: 0, sourcePath: '/api/' },
 *   { fn: corsMiddleware, priority: 5, sourceIndex: 1, sourcePath: '/api/' },
 *   { fn: loggingMiddleware, priority: 90, sourceIndex: 0, sourcePath: '/api/users/' }
 * ]
 * sortMiddlewareFunctions(middleware)
 * // Returns: [corsMiddleware, authMiddleware, loggingMiddleware]
 */
function sortMiddlewareFunctions(middlewareArray) {
  return middlewareArray
    .sort((a, b) => {
      // Level 1: Priority (00-99)
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }

      // Level 2: Function name alphabetically (arrow functions get inferred names)
      const aName = a.fn.name || ''
      const bName = b.fn.name || ''
      if (aName !== bName) {
        // Anonymous functions ("") come after named functions
        if (aName === '' && bName !== '') return 1
        if (aName !== '' && bName === '') return -1
        return aName.localeCompare(bName)
      }

      // Level 3: For anonymous functions, sort by original array position
      if (aName === '' && bName === '') {
        if (a.sourceIndex !== b.sourceIndex) {
          return a.sourceIndex - b.sourceIndex
        }
      }

      // Level 4: Source path specificity (longer paths = more specific)
      return a.sourcePath.length - b.sourcePath.length
    })
    .map((item) => item.fn)
}

/**
 * Retrieves and sorts middleware functions that match a given path
 * Finds all entries in the dictionary where the given path starts with the dictionary key,
 * sorts them by key length (shortest first), and returns the flattened array of middleware functions
 *
 * Supports both legacy middleware format (plain functions) and priority object format ({ fn, priority })
 * with backward compatibility. Priority objects are sorted using the four-level priority system.
 *
 * @param {Object<string, Function|Array<Function>|Array<Object>>} dictionary - Dictionary of paths to middleware functions or priority objects
 * @param {string} path - The path to match
 * @returns {Array<Function>} - Array of middleware functions that apply to the path, ordered by priority and path specificity
 *
 * @example
 * // With matching paths (legacy format)
 * const dict = {
 *   '/api/': [authMiddleware],
 *   '/api/users/': [userMiddleware]
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/profile');
 * // Returns: [authMiddleware, userMiddleware] (in order from least to most specific)
 *
 * @example
 * // With priority objects (new format)
 * const dict = {
 *   '/api/': [
 *     { fn: corsMiddleware, priority: 5 },
 *     { fn: authMiddleware, priority: 20 }
 *   ],
 *   '/api/users/': [
 *     { fn: userValidationMiddleware, priority: 15 }
 *   ]
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/profile');
 * // Returns: [corsMiddleware, userValidationMiddleware, authMiddleware] (sorted by priority)
 *
 * @example
 * // With mixed legacy and priority format (backward compatible)
 * const dict = {
 *   '/api/': [legacyMiddleware, { fn: priorityMiddleware, priority: 10 }],
 *   '/api/users/': userMiddleware  // Single function
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/');
 * // Returns: [priorityMiddleware, legacyMiddleware, userMiddleware] (priority objects sorted first)
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
 * // With null or undefined values in the dictionary (they are filtered out)
 * const dict = {
 *   '/api/': [authMiddleware, null],
 *   '/api/users/': undefined
 * };
 * dictionaryKeyStartsWithPath(dict, '/api/users/');
 * // Returns: [authMiddleware]
 *
 * @note Automatically converts legacy middleware functions to priority objects with default priority 50
 * @note Uses four-level sorting: priority → function name → source index → path specificity
 */
function dictionaryKeyStartsWithPath(dictionary, path) {
  if (!dictionary || typeof dictionary !== 'object') {
    throw new Error('Dictionary must be an object')
  }
  const allMiddleware = Object.entries(dictionary)
    .filter(([key]) => path.startsWith(key))
    .sort(([aKey], [bKey]) => aKey.length - bKey.length)
    .flatMap(([, value]) => {
      const middlewareArray = Array.isArray(value) ? value : [value]
      // Check if we have priority objects or plain functions for backward compatibility
      return middlewareArray
        .map((item, index) => {
          if (typeof item === 'function') {
            // Legacy format - convert to priority object
            return {
              fn: item,
              priority: 50,
              sourceIndex: index,
              sourcePath: ''
            }
          } else if (item && typeof item.fn === 'function') {
            // New format - already a priority object
            return item
          }
          return null
        })
        .filter(Boolean)
    })
    .filter(Boolean)

  return sortMiddlewareFunctions(allMiddleware)
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
function curryObjectMethods(router, urlPath, ...initialMiddleWareFunctions) {
  const originalRouter = router
  const httpMethods = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'options',
    'head',
    'all'
  ]
  const handler = {
    get(target, prop) {
      const originalHttpMethod = target[prop]
      if (
        typeof originalHttpMethod === 'function' &&
        httpMethods.includes(prop)
      ) {
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
async function buildMiddlewareDictionary(basePath, baseURL, options) {
  if (!statSync(basePath).isDirectory()) {
    throw new Error(`Base path "${basePath}" is not a directory`)
  }
  const dictionary = {}
  const traverseDirectory = async (currentPath, currentURL) => {
    const dirEntries = readdirSync(currentPath, { withFileTypes: true })
    for (const entry of dirEntries) {
      const entryPath = path.resolve(currentPath, entry.name)
      let entryURL = joinUrlPaths(currentURL, entry.name)
      if (entry.isDirectory()) {
        const dirInfo = parseDirectoryPriority(entry.name)
        const routeName = dirInfo.name
        if (isPlaceholder(routeName)) {
          entryURL = joinUrlPaths(currentURL, replaceUrlPlaceholders(routeName))
        } else {
          entryURL = joinUrlPaths(currentURL, routeName)
        }
        await traverseDirectory(entryPath, entryURL)
      } else if (isMiddlewareFile(entry)) {
        try {
          const middlewareModule = await loadModule(entryPath)
          const middleware = middlewareModule(options)
          if (
            !middleware ||
            (typeof middleware !== 'function' && !Array.isArray(middleware))
          ) {
            throw new Error(
              `Middleware at ${entryPath} must export a function or array of functions`
            )
          }
          const middlewareURL = entryURL.replace('_middleware.js', '')
          const normalizedMiddleware = normalizeMiddlewarePriority(
            middleware,
            0,
            middlewareURL
          )
          dictionary[middlewareURL] = normalizedMiddleware
        } catch (e) {
          throw new Error(
            `Failed to load middleware at ${entryPath}: ${e.message}`
          )
        }
      }
    }
  }
  await traverseDirectory(basePath, baseURL)
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
function buildRoutes(basePath, baseURL) {
  if (!statSync(basePath).isDirectory()) {
    throw new Error(`Base path "${basePath}" is not a directory`)
  }
  const result = []
  const queue = [[basePath, baseURL.endsWith('/') ? baseURL : baseURL + '/']]
  while (queue.length > 0) {
    const [currentPath, currentURL] = queue.shift()
    const files = readdirSync(currentPath)
    const indexFile = files.find((file) => file === 'index.js')
    if (indexFile) {
      const indexFilePath = path.resolve(currentPath, indexFile)
      result.push([currentURL, indexFilePath])
    }
    const directories = files
      .filter((file) => statSync(path.resolve(currentPath, file)).isDirectory())
      .map((dir) => path.join(currentPath, dir))
      .sort((a, b) => {
        const aParsed = parseDirectoryPriority(path.basename(a))
        const bParsed = parseDirectoryPriority(path.basename(b))

        // Primary sort: by priority (00-99)
        if (aParsed.priority !== bParsed.priority) {
          return aParsed.priority - bParsed.priority
        }

        // Secondary sort: static routes before dynamic routes
        if (aParsed.isDynamic !== bParsed.isDynamic) {
          return aParsed.isDynamic ? 1 : -1
        }

        // Tertiary sort: alphabetical by name
        return aParsed.name.localeCompare(bParsed.name)
      })

    directories.forEach((dir) => {
      const dirInfo = parseDirectoryPriority(path.basename(dir))
      const routeName = dirInfo.name // Use name without priority prefix

      let entryURL = joinUrlPaths(currentURL, routeName) + '/'
      if (isPlaceholder(routeName)) {
        entryURL =
          joinUrlPaths(currentURL, replaceUrlPlaceholders(routeName)) + '/'
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
async function composeRoutes(
  express,
  routeMappings,
  options = {
    routerOptions: { strict: true },
    middlewareOptions: undefined,
    controllerOptions: undefined
  }
) {
  if (!Array.isArray(routeMappings)) {
    routeMappings = [routeMappings]
  }
  const routerOptions = options.routerOptions || { strict: true }
  const middlewareOptions = options.middlewareOptions || undefined
  const controllerOptions = options.controllerOptions || undefined
  const router = express.Router(routerOptions)

  for (const { basePath, baseURL } of routeMappings) {
    validatePath(basePath)
    validatePath(baseURL)
    const middlewareFunctionDictionary = await buildMiddlewareDictionary(
      basePath,
      baseURL,
      middlewareOptions
    )
    const routes = buildRoutes(basePath, baseURL)

    for (const [url, filepath] of routes) {
      // curry the Router, so that the URL is set to the route, and the Middleware is loaded.
      let curriedRouter = curryObjectMethods(
        router,
        url,
        ...dictionaryKeyStartsWithPath(middlewareFunctionDictionary, url)
      )
      const controllerModule = await loadModule(filepath)
      const controllers = controllerModule
      if (typeof controllers !== 'function') {
        throw new Error(`Controller at ${filepath} must export a function`)
      }
      curriedRouter = controllers(curriedRouter, controllerOptions)
      if (!curriedRouter?._getOriginalObject) {
        throw new Error(
          `Controller at ${filepath} did not return a valid router (returned: ${curriedRouter})`
        )
      }
    }
  }

  return router
}

// Define exports object
const moduleExports = {
  loadModule,
  isMiddlewareFile,
  autoBox,
  replaceUrlPlaceholders,
  isPlaceholder,
  validatePath,
  joinUrlPaths,
  parseDirectoryPriority,
  normalizeMiddlewarePriority,
  sortMiddlewareFunctions,
  dictionaryKeyStartsWithPath,
  curryObjectMethods,
  buildMiddlewareDictionary,
  buildRoutes,
  composeRoutes,
  default: composeRoutes // For ESM default import compatibility and unfortuntely, rollup does not allow any way of exporting otherwise.
}

// Export for CommonJS
module.exports = moduleExports

//
// // CommonJS exports with ESM compatibility
// const moduleExports = {
//   loadModule,
//   isMiddlewareFile,
//   autoBox,
//   replaceUrlPlaceholders,
//   isPlaceholder,
//   validatePath,
//   joinUrlPaths,
//   parseDirectoryPriority,
//   normalizeMiddlewarePriority,
//   sortMiddlewareFunctions,
//   dictionaryKeyStartsWithPath,
//   curryObjectMethods,
//   buildMiddlewareDictionary,
//   buildRoutes,
//   composeRoutes,
//   default: composeRoutes  // Main export for ESM compatibility
// }
//
// // Export all named functions
// Object.assign(module.exports, moduleExports)
// // Also export as default for ESM compatibility
// module.exports.default = composeRoutes
