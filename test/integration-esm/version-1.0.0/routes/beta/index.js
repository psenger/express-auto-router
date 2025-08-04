const standardControllers = (req, res, _next) => res.status(200).send({
  route: `${req.baseUrl}${req.route.path}`,
  params: req.params,
  method: req.method.toLowerCase(),
  priority: 50,
  middleware: req.context && req.context.middleware ? req.context.middleware : []
})

export default (router) => {
  router.get(standardControllers)
  router.post(standardControllers)
  router.put(standardControllers)
  router.patch(standardControllers)
  router.delete(standardControllers)
  return router
}


