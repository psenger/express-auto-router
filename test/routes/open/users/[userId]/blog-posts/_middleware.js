module.exports = () => {
  function standard_blogpost_middleware(req, res, next) {
    req.params = req.params || {};
    req.params.context = req.params.context || {};
    // Merge the context object with req.params.context
    Object.assign(req.params.context, { blogPost: true })
    next()
  }
  return standard_blogpost_middleware
}
