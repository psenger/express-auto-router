
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

