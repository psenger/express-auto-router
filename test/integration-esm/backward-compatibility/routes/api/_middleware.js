export default () => {
  function globalMiddleware(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { global: true })
    
    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];
    
    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /api/_middleware.js globalMiddleware with priority: 50';
    req.context.middleware.push(middlewarePath);
    
    next()
  }
  return globalMiddleware
}