const middlewareName = 'level1'
module.exports = () => {
  const rootMiddlewareA = (req, res, next) => {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { root: true })

    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];

    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /_middleware.js rootMiddlewareA with priority: 99';
    req.context.middleware.push(middlewarePath);

    next()
  }
  const rootMiddlewareB = (req, res, next) => {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { root: true })

    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];

    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /_middleware.js rootMiddlewareB with priority: 98';
    req.context.middleware.push(middlewarePath);

    next()
  }

  const rootMiddlewareC = (req, res, next) => {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { root: true })

    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];

    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /_middleware.js rootMiddlewareC with priority: 1';
    req.context.middleware.push(middlewarePath);

    next()
  }

  return [
    { fn: rootMiddlewareA, priority: 99 },
    { fn: rootMiddlewareB, priority: 98 },
    { fn: rootMiddlewareC, priority: 1 }
  ]
}
