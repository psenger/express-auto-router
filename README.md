# [express-auto-router](https://github.com/psenger/express-auto-router#readme)

> [!TAG]
> 1.0.0

A dynamic route composition system for Express.js applications that automatically discovers and mount routes and middleware based on your file system structure. Inspired by Next.js routing conventions.

## Table of Contents

<!-- toc -->

- [Features](#features)
- [Installation](#installation)
- [How it Works](#how-it-works)
  * [1. Directory Structure as Routes](#1-directory-structure-as-routes)
  * [2. Key Design Decisions](#2-key-design-decisions)
    + [Dynamic Routes](#dynamic-routes)
    + [Hierarchical Middleware](#hierarchical-middleware)
    + [Strict Route Endings](#strict-route-endings)
- [Opinions in the Code](#opinions-in-the-code)
- [Potential Issues and Considerations](#potential-issues-and-considerations)
  * [1. Trailing Slash Handling](#1-trailing-slash-handling)
  * [2. Middleware Control](#2-middleware-control)
- [Best Practices When Using This System](#best-practices-when-using-this-system)
- [Future Considerations](#future-considerations)
  * [3. Priority-Based Routing](#3-priority-based-routing)
    + [The Problem: Route Registration Order](#the-problem-route-registration-order)
    + [Traditional Routing (Backward Compatible)](#traditional-routing-backward-compatible)
    + [Priority-Based Routing (Optional Enhancement)](#priority-based-routing-optional-enhancement)
    + [Dynamic Routes with Priorities](#dynamic-routes-with-priorities)
    + [Mixed Priority/Non-Priority Behavior](#mixed-prioritynon-priority-behavior)
    + [Route Priority Rules](#route-priority-rules)
    + [Common Use Cases](#common-use-cases)
    + [Middleware Priority Support](#middleware-priority-support)
      - [Traditional Middleware (Backward Compatible)](#traditional-middleware-backward-compatible)
      - [Priority-Based Middleware (Optional Enhancement)](#priority-based-middleware-optional-enhancement)
      - [Mixed Format Support](#mixed-format-support)
      - [Cross-Hierarchy Execution Order](#cross-hierarchy-execution-order)
      - [Priority Rules](#priority-rules)
- [API](#api)
  * [Functions](#functions)
  * [loadModule(modulePath) ⇒ Promise.&lt;any&gt; \| any](#loadmodulemodulepath-%E2%87%92-promiseltanygt--any)
  * [isMiddlewareFile(entry) ⇒ boolean](#ismiddlewarefileentry-%E2%87%92-boolean)
  * [autoBox(ary) ⇒ Array](#autoboxary-%E2%87%92-array)
  * [replaceUrlPlaceholders(urlPath) ⇒ string](#replaceurlplaceholdersurlpath-%E2%87%92-string)
  * [isPlaceholder(urlPath) ⇒ boolean](#isplaceholderurlpath-%E2%87%92-boolean)
  * [validatePath(path)](#validatepathpath)
  * [joinUrlPaths(base, segment) ⇒ string](#joinurlpathsbase-segment-%E2%87%92-string)
  * [parseDirectoryPriority(dirName) ⇒ Object](#parsedirectoryprioritydirname-%E2%87%92-object)
  * [normalizeMiddlewarePriority(middleware, sourceIndex, sourcePath) ⇒ Array](#normalizemiddlewareprioritymiddleware-sourceindex-sourcepath-%E2%87%92-array)
  * [sortMiddlewareFunctions(middlewareArray) ⇒ Array](#sortmiddlewarefunctionsmiddlewarearray-%E2%87%92-array)
  * [dictionaryKeyStartsWithPath(dictionary, path) ⇒ Array.&lt;function()&gt;](#dictionarykeystartswithpathdictionary-path-%E2%87%92-arrayltfunctiongt)
  * [curryObjectMethods(router, urlPath, ...initialMiddleWareFunctions) ⇒ Object](#curryobjectmethodsrouter-urlpath-initialmiddlewarefunctions-%E2%87%92-object)
  * [buildMiddlewareDictionary(basePath, baseURL, [options]) ⇒ Object.&lt;string, Array.&lt;function()&gt;&gt;](#buildmiddlewaredictionarybasepath-baseurl-options-%E2%87%92-objectltstring-arrayltfunctiongtgt)
  * [buildRoutes(basePath, baseURL) ⇒ Array.&lt;Array.&lt;string&gt;&gt;](#buildroutesbasepath-baseurl-%E2%87%92-arrayltarrayltstringgtgt)
  * [composeRoutes(express, routeMappings, [options]) ⇒ Object](#composeroutesexpress-routemappings-options-%E2%87%92-object)
- [Usage](#usage)
- [CommonJS (CJS) Usage](#commonjs-cjs-usage)
- [ES Modules (ESM) Usage](#es-modules-esm-usage)
- [Contributing](#contributing)
- [Rules](#rules)
- [Commit Message](#commit-message)
  * [Basic Format](#basic-format)
  * [Commit Types and CHANGELOG Impact](#commit-types-and-changelog-impact)
  * [Commit Examples](#commit-examples)
    + [Features](#features-1)
    + [Bug Fixes](#bug-fixes)
    + [Breaking Changes (for major releases)](#breaking-changes-for-major-releases)
    + [Other Types (won't appear in CHANGELOG)](#other-types-wont-appear-in-changelog)
  * [Commit Message Best Practices](#commit-message-best-practices)
  * [What Makes a Good Commit Message](#what-makes-a-good-commit-message)
- [Testing](#testing)
  * [Running Tests](#running-tests)
- [License](#license)
- [Acknowledgments](#acknowledgments)
  * [Dependencies](#dependencies)
  * [Development Dependencies](#development-dependencies)

<!-- tocstop -->

## Features

- 📁 **File-System Based Routing** - Automatically generates Express.js routes from your directory structure, similar to Next.js ( Convention over Configuration )
- 🔄 **Dynamic Route Parameters** - Supports dynamic route parameters using `[paramName]` syntax that converts to Express.js `:paramName` format
- 🔗 **Hierarchical Middleware** - Middleware cascades down from parent to child routes automatically
- 🎯 **Convention over Configuration** - Follows clear conventions with `_middleware.js` and `index.js` files
- 🔒 **Strict URL Handling** - Enforces consistent URL patterns with trailing slashes for better route organization
- 🎨 **Clean API Design** - Simple and intuitive API that requires minimal setup
- 🛠️ **Flexible Middleware Management**:
  - Global middleware at root level
  - Route-specific middleware at any level
  - Support for multiple middleware functions per route
  - **Priority-based middleware ordering** with optional `{ fn, priority }` objects
  - **Backward compatible** - Plain function returns continue to work unchanged
  - **Mixed format support** - Use priority objects and plain functions together
  - Cross-hierarchy middleware control and deterministic execution order
- 📦 **Zero External Dependencies** - Only requires Express.js as a peer dependency
- 🔍 **Type-Safe Path Parameters** - Directory names define your route parameters, ensuring consistency
- 🎮 **Full HTTP Method Support** - Works with all Express HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ⚡ **Performance Optimized** - Routes are compiled at startup, not on each request
- 🧪 **Testing Friendly** - Easy to test with clear route structure and middleware organization
- 🎯 **Priority-Based Routing** - Optional numeric prefix convention (`{priority}-{name}`) for deterministic route and middleware ordering
- 🔧 **Route Conflict Resolution** - Eliminates route shadowing issues with explicit priority control
- 📊 **Deterministic Behavior** - Routes always register in the same order across all environments


## Installation

<!--START_SECTION:file:INSTALLATION.md-->
**NPM**

```shell
npm install @psenger/express-auto-router --save
```
**YARN**

```shell
yarn add @psenger/express-auto-router
```

<!--END_SECTION:file:INSTALLATION.md-->

## How it Works

<!--START_SECTION:file:HOWITWORKS.md-->

Express Auto Router is an elegant solution that transforms your directory structure into a fully functional Express.js routing system. It follows the philosophy of "convention over configuration" similar to Next.js and Nuxt.js, but for Express.js backend applications.

### 1. Directory Structure as Routes
The system uses your file system structure to automatically generate Express routes. For example:
```
routes/
  ├── _middleware.js         # Global middleware
  ├── users/
  │   ├── _middleware.js     # Users-specific middleware
  │   ├── index.js           # /users/ endpoint
  │   └── [id]/              # Dynamic parameter
  │       ├── _middleware.js # User-specific middleware
  │       └── index.js       # /users/:id/ endpoint
```

### 2. Key Design Decisions

#### Dynamic Routes
- Uses a bracket notation `[paramName]` for dynamic route parameters
- Automatically converts these to Express.js style parameters (`:paramName`)
- Example: `/users/[userId]/posts/[postId]/` becomes `/users/:userId/posts/:postId/`

#### Hierarchical Middleware
One of the most powerful features is the hierarchical middleware system:
- Middleware cascades down from parent to child routes
- Each directory can have its own `_middleware.js` file
- Middleware is applied in order from most general to most specific
- Example: A request to `/api/users/123/` will execute middleware in this order:
  1. `/api/_middleware.js`
  2. `/api/users/_middleware.js`
  3. `/api/users/[id]/_middleware.js`

#### Strict Route Endings
An opinionated decision in the code is the use of trailing slashes (`/`). The router is configured with `{ strict: true }`, which means:
- All routes must end with a trailing slash
- `/users` and `/users/` are treated as different routes
- This is enforced throughout the system for consistency

## Opinions in the Code

1. **Strict Mode**
```javascript
const routerOptions = options.routerOptions || { strict: true }
```
The code enforces strict mode by default, treating trailing slashes as significant.

2. **Middleware File Naming**
```javascript
export function isMiddlewareFile(entry) {
  return entry.isFile() && entry.name === '_middleware.js'
}
```
The system expects middleware files to be named exactly `_middleware.js`.

3. **Hierarchical Middleware Organization**
The `dictionaryKeyStartsWithPath` function enforces a hierarchical middleware structure, sorting by path length to ensure proper execution order. Please note this is an opinion of how middleware should work and is baked into this system. If you want to control this it would have to be done inside the middleware.

4. **Parameter calls**

Global parameters/options can be passed to the controllers and middleware like this

```javascript

const middlewareOptions = { logLevel: debug }
const controllerOptions = { env: 'test' }
await composeRoutes(express, routeMappings, { middlewareOptions, controllerOptions } )
```

You should write your Controllers like this.

```javascript
module.exports = ( router, controllerOptions ) => {
  ...
  return router
}
```

You should write your Middleware like this.

```javascript
module.exports = ( middlewareOptions ) => {
  return [
    ...
  ]
}
```

## Potential Issues and Considerations

### 1. Trailing Slash Handling
The biggest potential issue is the strict trailing slash requirement:

**Pros:**
- Consistent URL structure
- Clear distinction between directories and files
- Prevents double-slash issues

**Cons:**
- Many load balancers and Nginx configurations may strip trailing slashes
- Can cause issues with some CDNs
- May require additional configuration in reverse proxies

**Mitigation Strategies:**
1. Configure Nginx to preserve trailing slashes:
```nginx
location / {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_redirect off;
}
```

2. Use URL rewriting rules to add trailing slashes if missing

### 2. Middleware Control
While the hierarchical middleware system is powerful, it can lead to unexpected behavior if not carefully managed. The code allows for fine-grained control through:

1. Selective middleware application
2. Middleware can check the route and choose to skip processing
3. Order of middleware is predictable based on path depth

## Best Practices When Using This System

1. **Consistent Route Structure**
   - Always use trailing slashes in your routes
   - Keep route parameters in brackets: `[paramName]`
   - Use descriptive parameter names

2. **Middleware Organization**
   - Place shared middleware at the highest appropriate level
   - Use middleware selectively - don't add unnecessary layers
   - Consider performance implications of deeply nested routes
   - **RECOMMENDED**: Use priority-based middleware for deterministic execution order

3. **Priority-Based Middleware Best Practice**
   - Use `{ fn: middleware, priority: number }` objects for critical middleware ordering
   - Assign priorities based on dependency requirements:
     - **CORS**: priority 5-10 (must execute first)
     - **Authentication**: priority 15-25 (after CORS)
     - **Validation**: priority 30-40 (after auth)
     - **Business logic**: priority 50-70 (default range)
     - **Logging/cleanup**: priority 80-90 (execute last)

4. **Mixed Format Example**
   ```javascript
   // routes/api/_middleware.js
   module.exports = (options) => {
     return [
       { fn: corsMiddleware, priority: 5 },     // Priority 5 - executes FIRST
       authMiddleware,                          // Plain function → priority 50 (default)
       { fn: rateLimitMiddleware, priority: 15 }, // Priority 15 - executes SECOND
       validationMiddleware,                    // Plain function → priority 50 (default)  
       { fn: loggingMiddleware, priority: 90 }  // Priority 90 - executes LAST
     ]
   }
   ```
   
   **Execution Order:**
   1. `corsMiddleware` (priority 5)
   2. `rateLimitMiddleware` (priority 15)  
   3. `authMiddleware` (priority 50 - plain function gets default)
   4. `validationMiddleware` (priority 50 - plain function gets default)
   5. `loggingMiddleware` (priority 90)

   **Key Point**: Plain functions without priority objects automatically get priority 50 (default). When multiple functions have the same priority, they execute in alphabetical order by function name.

5. **Error Handling**
   - Implement error handling middleware at the appropriate levels
   - Use the hierarchical structure to catch errors at the right scope
   - Place error handlers with priority 95-99 to ensure they execute last

6. **ESM Module Format Best Practices**
   - **Controller Files**: When using ESM (`export default`), ensure proper export format:
     ```javascript
     // ✅ Correct ESM controller format
     export default (router, controllerOptions) => {
       router.get((req, res) => res.json({}))
       return router
     }
     ```
   - **Middleware Files**: When using ESM (`export default`), ensure proper export format:
     ```javascript
     // ✅ Correct ESM middleware format  
     export default (middlewareOptions) => {
       function middleware(req, res, next) {
         // middleware logic
         next()
       }
       return middleware
     }
     ```
   - **Mixed Environments**: The library automatically handles both CommonJS and ESM modules
   - **Error Prevention**: Always use `export default` for the main function, not named exports
   - **Compatibility**: ESM modules work seamlessly with the library's universal module loader

7. **Testing**
   - Test routes with and without trailing slashes
   - Verify middleware execution order using priority system
   - Test dynamic parameter handling
   - Test mixed priority/non-priority middleware scenarios

## Future Considerations

1. **Optional Strict Mode**
   - Consider making the strict trailing slash behavior configurable
   - Add options for automatic slash handling

2. **Middleware Enhancement**
   - Implement middleware bypass options
   - Add middleware execution tracking for debugging

3. **Performance Optimization**
   - Cache route compilation results
   - Implement lazy loading for large route trees
   - Add route validation at startup

This system provides a powerful and elegant solution for Express.js routing, but users should be aware of its opinions and potential infrastructure considerations, particularly regarding the trailing slash requirement.

### 3. Priority-Based Routing

Express Auto Router supports an **optional** priority-based routing system that solves route conflicts and provides deterministic ordering. This feature is completely backward compatible - existing projects continue to work unchanged.

#### The Problem: Route Registration Order

Without priority control, routes register in filesystem alphabetical order, which can cause conflicts:

```
routes/
├── users/
│   ├── [id]/index.js           # Registers FIRST (alphabetically) → /users/:id/
│   └── admin/index.js          # Registers SECOND → /users/admin/
```

**Problem**: `/users/:id/` captures ALL requests, including `/users/admin/` because `:id` matches "admin".

#### Traditional Routing (Backward Compatible)

The traditional approach works exactly as before - no changes needed:

```
routes/
├── api/
│   ├── users/
│   │   ├── index.js            # /api/users/ → Priority 50 (default)
│   │   ├── profile/
│   │   │   └── index.js        # /api/users/profile/ → Priority 50 (default)
│   │   └── [id]/
│   │       └── index.js        # /api/users/:id/ → Priority 50 (default)
│   └── posts/
│       └── index.js            # /api/posts/ → Priority 50 (default)
```

**Registration Order** (alphabetical): `/api/posts/` → `/api/users/` → `/api/users/:id/` → `/api/users/profile/`

#### Priority-Based Routing (Optional Enhancement) 

Use numeric prefixes to control registration order when needed:

**Format**: `{priority}-{name}` where priority is 00-99 (lower numbers = higher priority = register first)

```
routes/
├── users/
│   ├── 10-all/index.js          # Priority 10 → /users/all/
│   ├── 15-[id]/index.js         # Priority 15 → /users/:id/  
│   ├── 20-admin/index.js        # Priority 20 → /users/admin/
│   ├── profile/index.js         # Priority 50 (default) → /users/profile/
│   ├── [sessionId]/index.js     # Priority 50 (default) → /users/:sessionId/
│   └── 90-settings/index.js     # Priority 90 → /users/settings/
```

**Registration Order**: `/users/all/` → `/users/:id/` → `/users/admin/` → `/users/profile/` → `/users/:sessionId/` → `/users/settings/`

#### Dynamic Routes with Priorities

Priority prefixes work with dynamic routes (placeholders) too:

```
routes/
├── api/
│   └── users/
│       ├── 05-[userId]/         # Priority 5 → /api/users/:userId/
│       ├── 10-all/              # Priority 10 → /api/users/all/
│       ├── 15-[id]/             # Priority 15 → /api/users/:id/
│       ├── 20-admin/            # Priority 20 → /api/users/admin/
│       ├── profile/             # Priority 50 (default) → /api/users/profile/
│       └── [sessionId]/         # Priority 50 (default) → /api/users/:sessionId/
```

**Why this works:**
- `/api/users/:userId/` (priority 5) registers first - catches specific user ID patterns
- `/api/users/all/` (priority 10) registers second - catches "all" requests  
- `/api/users/:id/` (priority 15) registers third - catches other ID patterns
- Static routes like `profile` and remaining dynamic routes follow

#### Mixed Priority/Non-Priority Behavior

You can mix prefixed and non-prefixed directories in the same project:

```
routes/
├── 05-critical/
│   └── index.js                 # Priority 5 → /critical/
├── api/
│   ├── users/
│   │   ├── 10-all/index.js      # Priority 10 → /api/users/all/
│   │   ├── profile/index.js     # Priority 50 (default) → /api/users/profile/
│   │   └── [id]/index.js        # Priority 50 (default) → /api/users/:id/
│   └── posts/index.js           # Priority 50 (default) → /api/posts/
└── public/
    └── index.js                 # Priority 50 (default) → /public/
```

**Three-Level Sorting Logic:**
1. **Priority Level** (00-99, default 50 for non-prefixed)
2. **Route Type** (static routes before dynamic routes at same priority)  
3. **Alphabetical** (for same priority and type)

**Final Registration Order:**
1. `/critical/` (priority 5)
2. `/api/users/all/` (priority 10)
3. `/api/posts/` (priority 50, alphabetically before public)
4. `/api/users/profile/` (priority 50, static)
5. `/public/` (priority 50, alphabetically after posts)
6. `/api/users/:id/` (priority 50, dynamic - comes after static at same priority)

#### Route Priority Rules

- **Priority range**: 00-99 (two digits required for sorting)
- **Lower numbers = higher priority** = register first
- **Default priority**: 50 for directories without numeric prefixes
- **URL path**: Priority prefix is stripped from the final URL (`10-users` becomes `/users/`)
- **Backward compatible**: Non-prefixed directories continue to work exactly as before
- **Deterministic**: Same registration order across all environments and filesystems

#### Common Use Cases

**Route Conflict Resolution:**
```
routes/
├── users/
│   ├── 05-all/index.js          # /users/all/ - registers before dynamic routes
│   ├── 10-admin/index.js        # /users/admin/ - specific route  
│   ├── 20-[id]/index.js         # /users/:id/ - general ID route
│   └── 90-[catchAll]/index.js   # /users/:catchAll/ - catch remaining patterns
```

**API Versioning:**
```
routes/
├── 10-v2/
│   └── users/index.js           # /v2/users/ - newer API version first
└── 50-v1/
    └── users/index.js           # /v1/users/ - legacy version
```

**Feature Flags:**
```
routes/
├── 01-beta/
│   └── features/index.js        # /beta/features/ - beta features first
└── features/index.js            # /features/ - stable features
```

#### Middleware Priority Support

Express Auto Router supports an **optional** priority-based middleware system that provides deterministic execution order across the directory hierarchy. This feature is completely backward compatible - existing projects continue to work unchanged.

##### Traditional Middleware (Backward Compatible)

The traditional approach continues to work exactly as before:

```javascript
// routes/_middleware.js
module.exports = (options) => {
  return authMiddleware  // Single function
}

// or return multiple functions
module.exports = (options) => {
  return [corsMiddleware, authMiddleware, loggingMiddleware]
}
```

##### Priority-Based Middleware (Optional Enhancement)

For precise control over execution order, use the priority object format:

```javascript
// routes/_middleware.js (parent directory)
module.exports = (options) => {
  return [
    { fn: corsMiddleware, priority: 5 },        // Execute FIRST
    { fn: authMiddleware, priority: 20 },       // After CORS
    { fn: loggingMiddleware, priority: 90 }     // Execute LAST
  ]
}

// routes/users/_middleware.js (child directory)
module.exports = (options) => {
  return [
    { fn: userValidationMiddleware, priority: 15 }, // After CORS, before auth
    { fn: userContextMiddleware, priority: 50 }     // Default priority
  ]
}
```

##### Mixed Format Support

You can mix both approaches in the same file:

```javascript
// routes/api/_middleware.js
module.exports = (options) => {
  return [
    corsMiddleware,                           // Plain function → priority 50 (default)
    { fn: authMiddleware, priority: 10 },     // Priority object → priority 10  
    rateLimitMiddleware,                      // Plain function → priority 50 (default)
    { fn: loggingMiddleware, priority: 90 }   // Priority object → priority 90
  ]
}
```

##### Cross-Hierarchy Execution Order

When a request hits `/users/profile/`, middleware from ALL directory levels is collected and sorted by priority:

**Directory Structure:**
```
routes/
├── _middleware.js          # CORS (priority 5), Auth (priority 20)
└── users/
    ├── _middleware.js      # User validation (priority 15), User context (priority 50)
    └── profile/
        └── index.js        # Route handler
```

**Final execution order for `/users/profile/`:**
1. **CORS middleware** (priority 5) - from `/`
2. **User validation** (priority 15) - from `/users/`  
3. **Auth middleware** (priority 20) - from `/`
4. **User context** (priority 50) - from `/users/`

##### Priority Rules

- **Priority range**: 0-99 (lower numbers = higher priority = execute first)
- **Default priority**: 50 for plain functions without priority specified
- **Cross-hierarchy**: Functions from any directory level can control their execution order
- **Deterministic**: Same execution order every time, across all environments

**Key Benefits:**
- **Backward Compatible**: Existing projects work unchanged
- **Optional**: Only use priorities where needed
- **Mixed Format Support**: Use priority objects and plain functions together
- **Deterministic**: Same behavior across all environments
- **Conflict Resolution**: Prevents middleware execution order issues


<!--END_SECTION:file:HOWITWORKS.md-->

<!--START_SECTION:jsdoc-->
## API

### Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#loadModule">loadModule(modulePath)</a> ⇒ <code>Promise.&lt;any&gt;</code> | <code>any</code></td>
    <td><p>Universal module loader that handles both CommonJS and ESM modules
Tries CommonJS first, falls back to dynamic import for ESM</p>
</td>
    </tr>
<tr>
    <td><a href="#isMiddlewareFile">isMiddlewareFile(entry)</a> ⇒ <code>boolean</code></td>
    <td><p>Checks if a directory entry is a middleware file</p>
</td>
    </tr>
<tr>
    <td><a href="#autoBox">autoBox(ary)</a> ⇒ <code>Array</code></td>
    <td><p>Ensures a value is always an array by wrapping non-array values</p>
</td>
    </tr>
<tr>
    <td><a href="#replaceUrlPlaceholders">replaceUrlPlaceholders(urlPath)</a> ⇒ <code>string</code></td>
    <td><p>Converts URL placeholder syntax [param] to Express parameter syntax :param</p>
</td>
    </tr>
<tr>
    <td><a href="#isPlaceholder">isPlaceholder(urlPath)</a> ⇒ <code>boolean</code></td>
    <td><p>Checks if a URL path contains a placeholder</p>
</td>
    </tr>
<tr>
    <td><a href="#validatePath">validatePath(path)</a></td>
    <td><p>Validates if a path is a non-empty string</p>
</td>
    </tr>
<tr>
    <td><a href="#joinUrlPaths">joinUrlPaths(base, segment)</a> ⇒ <code>string</code></td>
    <td><p>Safely joins URL paths without creating double slashes
Removes trailing slash from base and ensures segment starts with slash</p>
</td>
    </tr>
<tr>
    <td><a href="#parseDirectoryPriority">parseDirectoryPriority(dirName)</a> ⇒ <code>Object</code></td>
    <td><p>Parses directory name for priority prefix, extracts route name, and detects route type</p>
</td>
    </tr>
<tr>
    <td><a href="#normalizeMiddlewarePriority">normalizeMiddlewarePriority(middleware, sourceIndex, sourcePath)</a> ⇒ <code>Array</code></td>
    <td><p>Normalizes middleware to priority objects with consistent structure</p>
</td>
    </tr>
<tr>
    <td><a href="#sortMiddlewareFunctions">sortMiddlewareFunctions(middlewareArray)</a> ⇒ <code>Array</code></td>
    <td><p>Sorts and flattens middleware functions by four-level priority system</p>
</td>
    </tr>
<tr>
    <td><a href="#dictionaryKeyStartsWithPath">dictionaryKeyStartsWithPath(dictionary, path)</a> ⇒ <code>Array.&lt;function()&gt;</code></td>
    <td><p>Retrieves and sorts middleware functions that match a given path
Finds all entries in the dictionary where the given path starts with the dictionary key,
sorts them by key length (shortest first), and returns the flattened array of middleware functions</p>
<p>Supports both legacy middleware format (plain functions) and priority object format ({ fn, priority })
with backward compatibility. Priority objects are sorted using the four-level priority system.</p>
</td>
    </tr>
<tr>
    <td><a href="#curryObjectMethods">curryObjectMethods(router, urlPath, ...initialMiddleWareFunctions)</a> ⇒ <code>Object</code></td>
    <td><p>Creates a curried router object with pre-configured URL path and middleware
Returns a proxy to the original router that applies the given URL path and middleware functions
to all HTTP method calls (get, post, put, etc.) automatically</p>
</td>
    </tr>
<tr>
    <td><a href="#buildMiddlewareDictionary">buildMiddlewareDictionary(basePath, baseURL, [options])</a> ⇒ <code>Object.&lt;string, Array.&lt;function()&gt;&gt;</code></td>
    <td><p>Builds a dictionary of middleware functions from a directory structure
Recursively scans the given directory for &#39;_middleware.js&#39; files and builds a dictionary
mapping URL paths to their corresponding middleware functions</p>
</td>
    </tr>
<tr>
    <td><a href="#buildRoutes">buildRoutes(basePath, baseURL)</a> ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code></td>
    <td><p>Builds an array of route mappings from a directory structure
Recursively scans the given directory for &#39;index.js&#39; files and builds an array of
URL paths and their corresponding file paths, converting directory placeholders to Express params</p>
</td>
    </tr>
<tr>
    <td><a href="#composeRoutes">composeRoutes(express, routeMappings, [options])</a> ⇒ <code>Object</code></td>
    <td><p>Composes Express routes from a directory structure with middleware support.
This is the main function that processes route mappings, builds middleware dictionaries,
and configures an Express router with all discovered routes and middleware.</p>
</td>
    </tr>
</tbody>
</table>

<a name="loadModule"></a>

### loadModule(modulePath) ⇒ <code>Promise.&lt;any&gt;</code> \| <code>any</code>
Universal module loader that handles both CommonJS and ESM modules
Tries CommonJS first, falls back to dynamic import for ESM

**Kind**: global function  
**Returns**: <code>Promise.&lt;any&gt;</code> \| <code>any</code> - - The loaded module  

| Param | Type | Description |
| --- | --- | --- |
| modulePath | <code>string</code> | Path to the module to load |

<a name="isMiddlewareFile"></a>

### isMiddlewareFile(entry) ⇒ <code>boolean</code>
Checks if a directory entry is a middleware file

**Kind**: global function  
**Returns**: <code>boolean</code> - - True if the entry is a file named '_middleware.js'  

| Param | Type | Description |
| --- | --- | --- |
| entry | <code>Object</code> | The directory entry to check (fs.Dirent object) |

**Example**  
```js
// With a file entry for '_middleware.js'
const middlewareEntry = { isFile: () => true, name: '_middleware.js' };
isMiddlewareFile(middlewareEntry); // Returns: true
```
**Example**  
```js
// With a directory entry
const dirEntry = { isFile: () => false, name: '_middleware.js' };
isMiddlewareFile(dirEntry); // Returns: false
```
**Example**  
```js
// With a different file
const otherFileEntry = { isFile: () => true, name: 'index.js' };
isMiddlewareFile(otherFileEntry); // Returns: false
```
<a name="autoBox"></a>

### autoBox(ary) ⇒ <code>Array</code>
Ensures a value is always an array by wrapping non-array values

**Kind**: global function  
**Returns**: <code>Array</code> - - Wraps the value in an array, or if the input was an array already it will return it as is.  

| Param | Type | Description |
| --- | --- | --- |
| ary | <code>\*</code> | The value to convert to an array |

**Example**  
```js
// With a non-array value
autoBox(5); // Returns: [5]
```
**Example**  
```js
// With an array value
autoBox([1, 2, 3]); // Returns: [1, 2, 3]
```
**Example**  
```js
// With null or undefined
autoBox(null); // Returns: [null]
autoBox(undefined); // Returns: [undefined]
```
**Example**  
```js
// With an object
autoBox({ key: 'value' }); // Returns: [{ key: 'value' }]
```
<a name="replaceUrlPlaceholders"></a>

### replaceUrlPlaceholders(urlPath) ⇒ <code>string</code>
Converts URL placeholder syntax [param] to Express parameter syntax :param

**Kind**: global function  
**Returns**: <code>string</code> - - The URL path with Express-style parameters  

| Param | Type | Description |
| --- | --- | --- |
| urlPath | <code>string</code> | The URL path containing placeholders |

**Example**  
```js
// With single placeholder
replaceUrlPlaceholders('/users/[id]'); // Returns: '/users/:id'
```
**Example**  
```js
// With multiple placeholders
replaceUrlPlaceholders('/users/[id]/posts/[postId]'); // Returns: '/users/:id/posts/:postId'
```
**Example**  
```js
// With no placeholders
replaceUrlPlaceholders('/users/list'); // Returns: '/users/list'
```
**Example**  
```js
// With nested/complex placeholders
replaceUrlPlaceholders('/products/[category]/[id]/reviews/[reviewId]');
// Returns: '/products/:category/:id/reviews/:reviewId'
```
<a name="isPlaceholder"></a>

### isPlaceholder(urlPath) ⇒ <code>boolean</code>
Checks if a URL path contains a placeholder

**Kind**: global function  
**Returns**: <code>boolean</code> - - True if the path contains a placeholder  

| Param | Type | Description |
| --- | --- | --- |
| urlPath | <code>string</code> | The URL path to check |

**Example**  
```js
// With placeholder
isPlaceholder('/users/[id]'); // Returns: true
```
**Example**  
```js
// With multiple placeholders
isPlaceholder('/users/[id]/posts/[postId]'); // Returns: true
```
**Example**  
```js
// Without placeholder
isPlaceholder('/users/list'); // Returns: false
```
**Example**  
```js
// With square brackets in a different context (not a placeholder)
isPlaceholder('/users/list[all]'); // Returns: true (matches the regex pattern)
```
<a name="validatePath"></a>

### validatePath(path)
Validates if a path is a non-empty string

**Kind**: global function  
**Throws**:

- <code>Error</code> If path is not a string or is empty


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to validate |

**Example**  
```js
// With valid path
validatePath('/api/users'); // No error thrown
```
**Example**  
```js
// With empty string
try {
  validatePath('');
} catch (error) {
  console.error(error.message); // Outputs: 'Invalid path provided'
}
```
**Example**  
```js
// With null value
try {
  validatePath(null);
} catch (error) {
  console.error(error.message); // Outputs: 'Invalid path provided'
}
```
**Example**  
```js
// With non-string value
try {
  validatePath(123);
} catch (error) {
  console.error(error.message); // Outputs: 'Invalid path provided'
}
```
<a name="joinUrlPaths"></a>

### joinUrlPaths(base, segment) ⇒ <code>string</code>
Safely joins URL paths without creating double slashes
Removes trailing slash from base and ensures segment starts with slash

**Kind**: global function  
**Returns**: <code>string</code> - - The joined path without double slashes  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | The base URL path |
| segment | <code>string</code> | The path segment to append |

**Example**  
```js
// With base having trailing slash
joinUrlPaths('/api/', 'users')
// Returns: '/api/users'
```
**Example**  
```js
// With base not having trailing slash
joinUrlPaths('/api', 'users')
// Returns: '/api/users'
```
**Example**  
```js
// With segment having leading slash
joinUrlPaths('/api', '/users')
// Returns: '/api/users'
```
**Example**  
```js
// Preventing double slashes
joinUrlPaths('/api/', '/users')
// Returns: '/api/users'
```
**Example**  
```js
// With empty base (edge case)
joinUrlPaths('', 'users')
// Returns: '/users'
```
**Example**  
```js
// With empty segment (edge case)
joinUrlPaths('/api', '')
// Returns: '/api/'
```
**Example**  
```js
// With both empty (edge case)
joinUrlPaths('', '')
// Returns: '/'
```
<a name="parseDirectoryPriority"></a>

### parseDirectoryPriority(dirName) ⇒ <code>Object</code>
Parses directory name for priority prefix, extracts route name, and detects route type

**Kind**: global function  
**Returns**: <code>Object</code> - - { priority: number, name: string, hasPrefix: boolean, isDynamic: boolean }  
**Note**: Logs warning message to console.info when invalid priority prefix is detected (out of 00-99 range)  
**Note**: Valid priority range is 00-99; invalid ranges default to priority 50 with hasPrefix: false  

| Param | Type | Description |
| --- | --- | --- |
| dirName | <code>string</code> | Directory name (e.g., "10-users", "users", "05-[id]", "[sessionId]") |

**Example**  
```js
// With priority prefix and static route
parseDirectoryPriority("10-users")
// Returns: { priority: 10, name: "users", hasPrefix: true, isDynamic: false }
```
**Example**  
```js
// With priority prefix and dynamic route
parseDirectoryPriority("05-[userId]")
// Returns: { priority: 5, name: "[userId]", hasPrefix: true, isDynamic: true }
```
**Example**  
```js
// Without priority prefix (static route)
parseDirectoryPriority("users")
// Returns: { priority: 50, name: "users", hasPrefix: false, isDynamic: false }
```
**Example**  
```js
// Without priority prefix (dynamic route)
parseDirectoryPriority("[sessionId]")
// Returns: { priority: 50, name: "[sessionId]", hasPrefix: false, isDynamic: true }
```
**Example**  
```js
// Invalid priority range (falls back to default)
parseDirectoryPriority("150-invalid")
// Logs: "Invalid priority prefix detected in directory "150-invalid", using default priority 50"
// Returns: { priority: 50, name: "150-invalid", hasPrefix: false, isDynamic: false }
```
**Example**  
```js
// Invalid priority format (falls back to default)
parseDirectoryPriority("x5-invalid")
// Returns: { priority: 50, name: "x5-invalid", hasPrefix: false, isDynamic: false }
```
<a name="normalizeMiddlewarePriority"></a>

### normalizeMiddlewarePriority(middleware, sourceIndex, sourcePath) ⇒ <code>Array</code>
Normalizes middleware to priority objects with consistent structure

**Kind**: global function  
**Returns**: <code>Array</code> - Array of {fn, priority, sourceIndex, sourcePath} objects  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| middleware | <code>function</code> \| <code>Object</code> \| <code>Array</code> |  | Middleware function(s) or priority objects |
| sourceIndex | <code>number</code> | <code>0</code> | Original array position for tracking |
| sourcePath | <code>string</code> |  | Source path for specificity tracking |

**Example**  
```js
// With plain function
normalizeMiddlewarePriority(corsMiddleware, 0, '/api/')
// Returns: [{ fn: corsMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/api/' }]
```
**Example**  
```js
// With priority object
normalizeMiddlewarePriority({ fn: authMiddleware, priority: 10 }, 1, '/api/')
// Returns: [{ fn: authMiddleware, priority: 10, sourceIndex: 1, sourcePath: '/api/' }]
```
**Example**  
```js
// With array of mixed types
normalizeMiddlewarePriority([corsMiddleware, { fn: authMiddleware, priority: 20 }], 0, '/api/')
// Returns: [
//   { fn: corsMiddleware, priority: 50, sourceIndex: 0, sourcePath: '/api/' },
//   { fn: authMiddleware, priority: 20, sourceIndex: 1, sourcePath: '/api/' }
// ]
```
<a name="sortMiddlewareFunctions"></a>

### sortMiddlewareFunctions(middlewareArray) ⇒ <code>Array</code>
Sorts and flattens middleware functions by four-level priority system

**Kind**: global function  
**Returns**: <code>Array</code> - Array of middleware functions sorted by priority  

| Param | Type | Description |
| --- | --- | --- |
| middlewareArray | <code>Array</code> | Array of {fn, priority, sourceIndex, sourcePath} objects |

**Example**  
```js
// With mixed priority middleware
const middleware = [
  { fn: authMiddleware, priority: 20, sourceIndex: 0, sourcePath: '/api/' },
  { fn: corsMiddleware, priority: 5, sourceIndex: 1, sourcePath: '/api/' },
  { fn: loggingMiddleware, priority: 90, sourceIndex: 0, sourcePath: '/api/users/' }
]
sortMiddlewareFunctions(middleware)
// Returns: [corsMiddleware, authMiddleware, loggingMiddleware]
```
<a name="dictionaryKeyStartsWithPath"></a>

### dictionaryKeyStartsWithPath(dictionary, path) ⇒ <code>Array.&lt;function()&gt;</code>
Retrieves and sorts middleware functions that match a given path
Finds all entries in the dictionary where the given path starts with the dictionary key,
sorts them by key length (shortest first), and returns the flattened array of middleware functions

Supports both legacy middleware format (plain functions) and priority object format ({ fn, priority })
with backward compatibility. Priority objects are sorted using the four-level priority system.

**Kind**: global function  
**Returns**: <code>Array.&lt;function()&gt;</code> - - Array of middleware functions that apply to the path, ordered by priority and path specificity  
**Note**: Automatically converts legacy middleware functions to priority objects with default priority 50  
**Note**: Uses four-level sorting: priority → function name → source index → path specificity  

| Param | Type | Description |
| --- | --- | --- |
| dictionary | <code>Object.&lt;string, (function()\|Array.&lt;function()&gt;\|Array.&lt;Object&gt;)&gt;</code> | Dictionary of paths to middleware functions or priority objects |
| path | <code>string</code> | The path to match |

**Example**  
```js
// With matching paths (legacy format)
const dict = {
  '/api/': [authMiddleware],
  '/api/users/': [userMiddleware]
};
dictionaryKeyStartsWithPath(dict, '/api/users/profile');
// Returns: [authMiddleware, userMiddleware] (in order from least to most specific)
```
**Example**  
```js
// With priority objects (new format)
const dict = {
  '/api/': [
    { fn: corsMiddleware, priority: 5 },
    { fn: authMiddleware, priority: 20 }
  ],
  '/api/users/': [
    { fn: userValidationMiddleware, priority: 15 }
  ]
};
dictionaryKeyStartsWithPath(dict, '/api/users/profile');
// Returns: [corsMiddleware, userValidationMiddleware, authMiddleware] (sorted by priority)
```
**Example**  
```js
// With mixed legacy and priority format (backward compatible)
const dict = {
  '/api/': [legacyMiddleware, { fn: priorityMiddleware, priority: 10 }],
  '/api/users/': userMiddleware  // Single function
};
dictionaryKeyStartsWithPath(dict, '/api/users/');
// Returns: [priorityMiddleware, legacyMiddleware, userMiddleware] (priority objects sorted first)
```
**Example**  
```js
// With no matching paths
const dict = {
  '/api/': [authMiddleware],
  '/api/users/': [userMiddleware]
};
dictionaryKeyStartsWithPath(dict, '/admin/');
// Returns: []
```
**Example**  
```js
// With null or undefined values in the dictionary (they are filtered out)
const dict = {
  '/api/': [authMiddleware, null],
  '/api/users/': undefined
};
dictionaryKeyStartsWithPath(dict, '/api/users/');
// Returns: [authMiddleware]
```
<a name="curryObjectMethods"></a>

### curryObjectMethods(router, urlPath, ...initialMiddleWareFunctions) ⇒ <code>Object</code>
Creates a curried router object with pre-configured URL path and middleware
Returns a proxy to the original router that applies the given URL path and middleware functions
to all HTTP method calls (get, post, put, etc.) automatically

**Kind**: global function  
**Returns**: <code>Object</code> - - Curried router proxy with pre-configured path and middleware  

| Param | Type | Description |
| --- | --- | --- |
| router | <code>Object</code> | Express router instance |
| urlPath | <code>string</code> | The URL path to be curried |
| ...initialMiddleWareFunctions | <code>function</code> | Initial middleware functions to be applied (rest parameter, accepts multiple functions) |

**Example**  
```js
// Basic usage with a single middleware function
const router = express.Router();
const curriedRouter = curryObjectMethods(router, '/users', authMiddleware);
curriedRouter.get((req, res) => res.json({}));
// Equivalent to: router.get('/users', authMiddleware, (req, res) => res.json({}));
```
**Example**  
```js
// With multiple middleware functions
const curriedRouter = curryObjectMethods(router, '/posts', authMiddleware, logMiddleware);
curriedRouter.post((req, res) => res.status(201).json({}));
// Equivalent to: router.post('/posts', authMiddleware, logMiddleware, (req, res) => res.status(201).json({}));
```
**Example**  
```js
// With no middleware
const curriedRouter = curryObjectMethods(router, '/public');
curriedRouter.get((req, res) => res.send('Hello'));
// Equivalent to: router.get('/public', (req, res) => res.send('Hello'));
```
**Example**  
```js
// Accessing the original router object
const curriedRouter = curryObjectMethods(router, '/api');
const originalRouter = curriedRouter._getOriginalObject();
// originalRouter is the router instance passed in the first parameter
```
<a name="buildMiddlewareDictionary"></a>

### buildMiddlewareDictionary(basePath, baseURL, [options]) ⇒ <code>Object.&lt;string, Array.&lt;function()&gt;&gt;</code>
Builds a dictionary of middleware functions from a directory structure
Recursively scans the given directory for '_middleware.js' files and builds a dictionary
mapping URL paths to their corresponding middleware functions

**Kind**: global function  
**Returns**: <code>Object.&lt;string, Array.&lt;function()&gt;&gt;</code> - Dictionary where keys are URL paths and values are arrays of middleware functions  

| Param | Type | Description |
| --- | --- | --- |
| basePath | <code>string</code> | Base filesystem path to start scanning |
| baseURL | <code>string</code> | Base URL path for the routes |
| [options] | <code>Object</code> | Options that can be passed to all controllers when they are executed. |

**Example**  
```js
// Basic directory structure with middleware
// ./src/routes/_middleware.js         -> exports a global middleware
// ./src/routes/users/_middleware.js   -> exports a users-specific middleware
const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
// Returns: {
//   '/api/': [globalMiddleware],
//   '/api/users/': [usersMiddleware]
// }
```
**Example**  
```js
// With dynamic route parameters
// ./src/routes/users/[id]/_middleware.js  -> exports a user-specific middleware
const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
// Returns: {
//   '/api/': [globalMiddleware],
//   '/api/users/': [usersMiddleware],
//   '/api/users/:id/': [userSpecificMiddleware]
// }
```
**Example**  
```js
// With middleware exporting multiple functions
// ./src/routes/_middleware.js  -> exports [authMiddleware, logMiddleware]
const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
// Returns: {
//   '/api/': [authMiddleware, logMiddleware]
// }
```
**Example**  
```js
// With middleware exporting a single function
// ./src/routes/_middleware.js  -> exports singleMiddleware (not in an array)
const middlewares = buildMiddlewareDictionary('./src/routes', '/api');
// Returns: {
//   '/api/': [singleMiddleware]
// }
```
<a name="buildRoutes"></a>

### buildRoutes(basePath, baseURL) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
Builds an array of route mappings from a directory structure
Recursively scans the given directory for 'index.js' files and builds an array of
URL paths and their corresponding file paths, converting directory placeholders to Express params

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;string&gt;&gt;</code> - Array of tuples where first element is URL path and second is file path  

| Param | Type | Description |
| --- | --- | --- |
| basePath | <code>string</code> | Base filesystem path to start scanning |
| baseURL | <code>string</code> | Base URL path for the routes |

**Example**  
```js
// Basic directory structure
// ./src/routes/users/index.js
// ./src/routes/posts/index.js
const routes = buildRoutes('./src/routes', '/api');
// Returns: [
//   ['/api/users/', './src/routes/users/index.js'],
//   ['/api/posts/', './src/routes/posts/index.js']
// ]
```
**Example**  
```js
// With dynamic route parameters
// ./src/routes/users/[id]/index.js
const routes = buildRoutes('./src/routes', '/api');
// Returns: [
//   ['/api/users/:id/', './src/routes/users/[id]/index.js']
// ]
```
**Example**  
```js
// With nested dynamic routes
// ./src/routes/users/[userId]/posts/[postId]/index.js
const routes = buildRoutes('./src/routes', '/api');
// Returns: [
//   ['/api/users/:userId/posts/:postId/', './src/routes/users/[userId]/posts/[postId]/index.js']
// ]
```
**Example**  
```js
// With root route
// ./src/routes/index.js
const routes = buildRoutes('./src/routes', '/api');
// Returns: [
//   ['/api/', './src/routes/index.js']
// ]
```
<a name="composeRoutes"></a>

### composeRoutes(express, routeMappings, [options]) ⇒ <code>Object</code>
Composes Express routes from a directory structure with middleware support.
This is the main function that processes route mappings, builds middleware dictionaries,
and configures an Express router with all discovered routes and middleware.

**Kind**: global function  
**Returns**: <code>Object</code> - Configured Express router with applied routes  

| Param | Type | Description |
| --- | --- | --- |
| express | <code>Object</code> | The Express module instance |
| routeMappings | <code>Array.&lt;Object&gt;</code> | Array of route mapping configurations |
| routeMappings[].basePath | <code>string</code> | Base filesystem path to start scanning |
| routeMappings[].baseURL | <code>string</code> | Base URL path for the routes |
| [options] | <code>Object</code> | Configuration options |
| [options.routerOptions] | <code>Object</code> | Options for the Express router (default: `{ strict: true }` stay with this for best results but be advised it makes paths require to be terminated with `/` ) |
| [options.middlewareOptions] | <code>Object</code> | Options passed to every middleware. |
| [options.controllerOptions] | <code>Object</code> | Options passed to every controller. |

**Example**  
```js
// Basic usage with a single route mapping
const express = require('express');
const app = express();

const router = await composeRoutes(express, [
  {
    basePath: './src/routes',
    baseURL: '/api'
  }
]);

app.use(router);
// This will set up all routes found in './src/routes' with their middleware
```
**Example**  
```js
// With multiple route mappings
const router = await composeRoutes(express, [
  {
    basePath: './src/api/routes',
    baseURL: '/api'
  },
  {
    basePath: './src/admin/routes',
    baseURL: '/admin'
  }
]);
```
**Example**  
```js
// With custom router options
const router = await composeRoutes(express, [
  {
    basePath: './src/routes',
    baseURL: '/api'
  }
], {
  routerOptions: {
    strict: true,
  }
});
```
**Example**  
```js
// With an existing router instance
const existingRouter = express.Router();
const router = await composeRoutes(express, [
  {
    basePath: './src/routes',
    baseURL: '/api'
  }
], {
  router: existingRouter
});
```

<!--END_SECTION:jsdoc-->

## Usage

<!--START_SECTION:file:USAGE.md-->
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
app.use('/api', await composeRoutes(express, routeMappings))
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
app.use('/api', await composeRoutes(express, routeMappings))
export default app
```

<!--END_SECTION:file:USAGE.md-->

## Contributing

<!--START_SECTION:file:CONTRIBUTING.md-->

Thanks for contributing! 😁 Here are some rules that will make your change to
Express-auto-router fruitful.

## Rules

- Raise a ticket to the feature or bug can be discussed
- Pull requests are welcome, but must be accompanied by a ticket approved by the repo owner
- You are expected to add a unit test or two to cover the proposed changes.
- Please run the tests and make sure tests are all passing before submitting your pull request
- Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., tabs instead of spaces, etc)
  - we have provided the following: `.editorconfig` and `.eslintrc`
  - Don't tamper with or change `.editorconfig` and `.eslintrc`
- Please consider adding an example under examples/ that demonstrates any new functionality

## Commit Message

This module uses [release-please](https://github.com/googleapis/release-please) which
needs commit messages to look like the following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Basic Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**type** is typically `fix`, `feat`. When **type** ends with a `!` or includes `BREAKING CHANGE` in the body/footer, it indicates this is a breaking change.

**type** should be followed by a short description, **<description>**

**optional body** can have more detail

### Commit Types and CHANGELOG Impact

The following commit types will be grouped in the CHANGELOG:

| Type     | Description              | CHANGELOG Section        | Example                                       |
| -------- | ------------------------ | ------------------------ | --------------------------------------------- |
| `feat`   | New feature              | Features                 | `feat: add markdown table support`            |
| `fix`    | Bug fix                  | Bug Fixes                | `fix: resolve parsing error for nested lists` |
| `perf`   | Performance improvement  | Performance Improvements | `perf: optimize regex for faster parsing`     |
| `revert` | Revert a previous commit | Reverts                  | `revert: feat: add markdown table support`    |

The following types are valid but typically **excluded** from CHANGELOG:

- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Commit Examples

#### Features

```bash
# Simple feature
git commit -m "feat: add support for custom fence renderers"

# Feature with scope (include ticket if applicable)
git commit -m "feat(parser): add HTML5 output option (TICKET-123)"

# Feature with detailed body
git commit -m "feat: add plugin system for custom syntaxes" -m "- Support for registering custom parsers
- Add hooks for pre/post processing
- Include TypeScript definitions"
```

#### Bug Fixes

```bash
# Simple fix
git commit -m "fix: correct fence detection for indented blocks"

# Fix with scope and ticket
git commit -m "fix(lexer): handle edge case in nested fences (TICKET-456)"
```

#### Breaking Changes (for major releases)

```bash
# Method 1: Using ! after type
git commit -m "feat!: change API to use async/await pattern"

# Method 2: Using BREAKING CHANGE in body
git commit -m "feat: redesign parser API" -m "BREAKING CHANGE: parse() now returns a Promise instead of synchronous result.
Update all calls to use await or .then()"

# Method 3: Multi-line format
git commit -m "refactor: update configuration schema

BREAKING CHANGE: Config property 'enableLegacy' removed.
Use 'parserMode: \"legacy\"' instead.

Closes #789"
```

#### Other Types (won't appear in CHANGELOG)

```bash
# Documentation
git commit -m "docs: improve API documentation examples"

# Code style
git commit -m "style: apply eslint formatting rules"

# Tests
git commit -m "test: add edge cases for fence parsing"

# Build/Dependencies
git commit -m "build: update to webpack 5"
git commit -m "chore: bump dependencies"

# CI/CD
git commit -m "ci: add Node.js 20 to test matrix"
```

### Commit Message Best Practices

1. **First line** should be no more than 72 characters
2. **Use present tense** ("add feature" not "added feature")
3. **Use imperative mood** ("fix bug" not "fixes bug")
4. **Reference tickets** when applicable: `feat(TICKET-123): add feature` or include in body
5. **Be specific** - "fix: resolve memory leak in parser" is better than "fix: fix bug"

### What Makes a Good Commit Message

❌ **Bad:**

```
Added new feature
fix
Updated code
FEAT: ADD PARSER (wrong case)
feat - add parser (wrong separator)
```

✅ **Good:**

```
feat: add markdown table parsing support
fix: prevent infinite loop when parsing malformed fences
feat(parser): implement GFM-style strikethrough (TICKET-234)
fix!: correct fence regex to match spec

BREAKING CHANGE: Fences with spaces after opening backticks are no longer valid.
This aligns with CommonMark specification.
```

## Testing

- All tests are expected to work
- Tests are based off of `dist/index.js` **NOT** your src code. Therefore, you should BUILD it first.
- Coverage should not go down, and I acknowledge it is very difficult to get the tests to 100%

### Running Tests

```bash
# Build first
npm run build

# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run linting
npm run test:lint

# Run integration tests
cd test/integration-cjs && npm test
cd test/integration-esm && npm test
```

<!--END_SECTION:file:CONTRIBUTING.md-->

## License

<!--START_SECTION:file:LICENSE-->
MIT License

Copyright (c) 2025 Philip A Senger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<!--END_SECTION:file:LICENSE-->

<!--START_SECTION:file:THIRD_PARTY_NOTICES.md-->

## Acknowledgments

This project directly uses the following open-source packages:

### Dependencies

- None

### Development Dependencies

- [@psenger/markdown-fences](https://github.com/psenger/markdown-fences) - MIT License
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins) - MIT License
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins) - MIT License
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) - MIT License
- [eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest) - MIT License
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) - MIT License
- [eslint](https://github.com/eslint/eslint) - MIT License
- [express](https://github.com/expressjs/express) - MIT License
- [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters) - MIT License
- [jest](https://github.com/jestjs/jest) - MIT License
- [jsdoc](https://github.com/jsdoc/jsdoc) - Apache-2.0 License
- [license-checker](https://github.com/davglass/license-checker) - BSD-3-Clause License
- [markdown-toc](https://github.com/jonschlinkert/markdown-toc) - MIT License
- [prettier](https://github.com/prettier/prettier) - MIT License
- [rimraf](https://github.com/isaacs/rimraf) - ISC License
- [rollup](https://github.com/rollup/rollup) - MIT License
- [standard-version](https://github.com/conventional-changelog/standard-version) - ISC License
- [supertest](https://github.com/ladjs/supertest) - MIT License

<!--END_SECTION:file:THIRD_PARTY_NOTICES.md-->
