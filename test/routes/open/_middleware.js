module.exports = () => {
  function standard_middleware(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    // Merge the context object with req.params.context
    Object.assign(req.params.context, { globalMiddleware: true })
    next()
  }
  return [
    standard_middleware
  ]
}
