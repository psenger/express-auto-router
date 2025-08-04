export default () => {
  const apiMiddlewareAA = (req, res, next) => {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { api: true })

    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];

    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /api/_middleware.js apiMiddlewareAA with priority: 95';
    req.context.middleware.push(middlewarePath);

    next()
  }

  const apiMiddlewareBB = (req, res, next) => {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { api: true })

    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];

    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /api/_middleware.js apiMiddlewareBB with priority: 96';
    req.context.middleware.push(middlewarePath);

    next()
  }

  return [
    { fn: apiMiddlewareAA, priority: 95 },
    { fn: apiMiddlewareBB, priority: 96 },
  ]
}
