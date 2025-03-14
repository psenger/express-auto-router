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
    if ( req.params.context.first ) {
      Object.assign(req.params.context, { second: true })
      return next()
    }
    next(new Error('Missing required first execution of the middleware') )
  }
  return [
    standard_middleware_must_go_first,
    standard_middleware_must_go_second
  ]
}
