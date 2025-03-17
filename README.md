# [express-auto-router](https://github.com/psenger/express-auto-router#readme)

> [!TAG]
> 0.0.3

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
- [API](#api)
  * [Functions](#functions)
  * [isMiddlewareFile(entry) ⇒ boolean](#ismiddlewarefileentry-%E2%87%92-boolean)
  * [autoBox(ary) ⇒ Array](#autoboxary-%E2%87%92-array)
  * [replaceUrlPlaceholders(urlPath) ⇒ string](#replaceurlplaceholdersurlpath-%E2%87%92-string)
  * [isPlaceholder(urlPath) ⇒ boolean](#isplaceholderurlpath-%E2%87%92-boolean)
  * [validatePath(path)](#validatepathpath)
  * [dictionaryKeyStartsWithPath(dictionary, path) ⇒ Array.&lt;function()&gt;](#dictionarykeystartswithpathdictionary-path-%E2%87%92-arrayltfunctiongt)
  * [curryObjectMethods(router, urlPath, ...initialMiddleWareFunctions) ⇒ Object](#curryobjectmethodsrouter-urlpath-initialmiddlewarefunctions-%E2%87%92-object)
  * [buildMiddlewareDictionary(basePath, baseURL, [options]) ⇒ Object.&lt;string, Array.&lt;function()&gt;&gt;](#buildmiddlewaredictionarybasepath-baseurl-options-%E2%87%92-objectltstring-arrayltfunctiongtgt)
  * [buildRoutes(basePath, baseURL) ⇒ Array.&lt;Array.&lt;string&gt;&gt;](#buildroutesbasepath-baseurl-%E2%87%92-arrayltarrayltstringgtgt)
  * [composeRoutes(express, routeMappings, [options]) ⇒ Object](#composeroutesexpress-routemappings-options-%E2%87%92-object)
- [Usage](#usage)
- [Contributing](#contributing)
  * [Rules](#rules)
  * [Commit Message](#commit-message)
  * [Testing](#testing)
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
  - Middleware execution order preservation
- 📦 **Zero External Dependencies** - Only requires Express.js as a peer dependency
- 🔍 **Type-Safe Path Parameters** - Directory names define your route parameters, ensuring consistency
- 🎮 **Full HTTP Method Support** - Works with all Express HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ⚡ **Performance Optimized** - Routes are compiled at startup, not on each request
- 🧪 **Testing Friendly** - Easy to test with clear route structure and middleware organization


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
composeRoutes(express, routeMappings, { middlewareOptions, controllerOptions } )
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

3. **Error Handling**
   - Implement error handling middleware at the appropriate levels
   - Use the hierarchical structure to catch errors at the right scope

4. **Testing**
   - Test routes with and without trailing slashes
   - Verify middleware execution order
   - Test dynamic parameter handling

## Future Considerations

1. **Optional Strict Mode**
   - Consider making the strict trailing slash behavior configurable
   - Add options for automatic slash handling

2. **Middleware Enhancement**
   - Add support for middleware priority ordering
   - Implement middleware bypass options
   - Add middleware execution tracking for debugging

3. **Performance Optimization**
   - Cache route compilation results
   - Implement lazy loading for large route trees
   - Add route validation at startup

This system provides a powerful and elegant solution for Express.js routing, but users should be aware of its opinions and potential infrastructure considerations, particularly regarding the trailing slash requirement.

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
    <td><a href="#dictionaryKeyStartsWithPath">dictionaryKeyStartsWithPath(dictionary, path)</a> ⇒ <code>Array.&lt;function()&gt;</code></td>
    <td><p>Retrieves and sorts middleware functions that match a given path
Finds all entries in the dictionary where the given path starts with the dictionary key,
sorts them by key length (shortest first), and returns the flattened array of middleware functions</p>
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
<a name="dictionaryKeyStartsWithPath"></a>

### dictionaryKeyStartsWithPath(dictionary, path) ⇒ <code>Array.&lt;function()&gt;</code>
Retrieves and sorts middleware functions that match a given path
Finds all entries in the dictionary where the given path starts with the dictionary key,
sorts them by key length (shortest first), and returns the flattened array of middleware functions

**Kind**: global function  
**Returns**: <code>Array.&lt;function()&gt;</code> - - Array of middleware functions that apply to the path, ordered by path specificity  

| Param | Type | Description |
| --- | --- | --- |
| dictionary | <code>Object.&lt;string, (function()\|Array.&lt;function()&gt;)&gt;</code> | Dictionary of paths to middleware functions |
| path | <code>string</code> | The path to match |

**Example**  
```js
// With matching paths
const dict = {
  '/api/': [authMiddleware],
  '/api/users/': [userMiddleware]
};
dictionaryKeyStartsWithPath(dict, '/api/users/profile');
// Returns: [authMiddleware, userMiddleware] (in order from least to most specific)
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
// With mixed array and single function values
const dict = {
  '/api/': [authMiddleware, logMiddleware],
  '/api/users/': userMiddleware
};
dictionaryKeyStartsWithPath(dict, '/api/users/');
// Returns: [authMiddleware, logMiddleware, userMiddleware]
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

const router = composeRoutes(express, [
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
const router = composeRoutes(express, [
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
const router = composeRoutes(express, [
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
const router = composeRoutes(express, [
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

```javascript

const express = require('express')
const { join } = require('path')
const composeRoutes = require('@psenger/express-auto-router').default
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

<!--END_SECTION:file:USAGE.md-->

## Contributing

<!--START_SECTION:file:CONTRIBUTING.md-->

Thanks for contributing! 😁 Here are some rules that will make your change to
markdown-fences fruitful.

### Rules

* Raise a ticket to the feature or bug can be discussed
* Pull requests are welcome, but must be accompanied by a ticket approved by the repo owner
* You are expected to add a unit test or two to cover the proposed changes.
* Please run the tests and make sure tests are all passing before submitting your pull request
* Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., tabs instead of spaces, etc)
  * we have provided the following: `.editorconfig` and `.eslintrc`
  * Don't tamper with or change `.editorconfig` and `.eslintrc`
* Please consider adding an example under examples/ that demonstrates any new functionality

### Commit Message

This module uses [release-please](https://github.com/googleapis/release-please) which
needs commit messages to look like the following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

```
<type>[optional scope]: <description>

[optional body]

```

**type** is typically `fix`, `feat`. When **type** ends with a `!` or is `BREAKING CHANGE` it indicates this is a breaking change.

**type** should be followed by a short description, **<description>**

**optional body** can have more detail

### Testing

* All tests are expected to work
* Tests are based off of `dist/index.js` **NOT** your src code. Therefore, you should BUILD it first.
* Coverage should not go down, and I acknowledge it is very difficult to get the tests to 100%

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
