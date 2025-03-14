const microMiddleware = (req, res, next) => {
  req.params = req.params || {};
  req.params.context = req.params.context || {};
  // Merge the context object with req.params.context
  Object.assign(req.params.context, { microMiddleware: true })
  next()
}

const standard_controllers = (req, res, _next) => res.status(200).send({route: `${req.baseUrl}${req.route.path}`, params: req.params})

module.exports = ( router ) => {
  router.get(microMiddleware,standard_controllers)
  router.post(microMiddleware,standard_controllers)
  router.put(microMiddleware,standard_controllers)
  router.patch(microMiddleware,standard_controllers)
  router.delete(microMiddleware,standard_controllers)
  return router
}



