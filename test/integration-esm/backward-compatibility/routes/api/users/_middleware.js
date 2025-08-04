export default () => {
  function userMiddleware(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    Object.assign(req.params.context, { user: true })
    
    // Initialize middleware array if it doesn't exist
    req.context = req.context || {};
    req.context.middleware = req.context.middleware || [];
    
    // Add this middleware path to the array - track execution order
    const middlewarePath = 'executed /api/users/_middleware.js userMiddleware with priority: 50';
    req.context.middleware.push(middlewarePath);
    
    next()
  }
  return userMiddleware
}