const standard_controllers = (req, res, _next) => res.status(200).send({route: `${req.baseUrl}${req.route.path}`, params: req.params})

module.exports = ( router ) => {
  router.get(standard_controllers)
  router.post(standard_controllers)
  router.put(standard_controllers)
  router.patch(standard_controllers)
  router.delete(standard_controllers)
  // Intentionally not returning the router to test error case
} 