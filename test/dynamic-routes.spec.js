const request = require('supertest')
const app = require('./app')
function replaceRouteParams(routeString, paramsObject) {
  const placeholderRegex = /\[([^\]]+)\]/g
  const paramNames = [...new Set(
    [...routeString.matchAll(placeholderRegex)]
      .map(match => match[1])
  )]
  if (paramNames.length === 0) return routeString
  const missingParams = paramNames.filter(param => !(param in paramsObject))
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
  }
  return paramNames.reduce(
    (result, param) => result.replaceAll(`[${param}]`, paramsObject[param]),
    routeString
  )
}
function convertPlaceholderFormat(routeString) {
  const placeholderRegex = /\[([^\]]+)\]/g
  return routeString.replace(placeholderRegex, (_, paramName) => `:${paramName}`)
}
describe('Express API Routes', () => {
  const methods = ['get', 'post', 'put', 'patch', 'delete']
  const routeAndParams = [
    // Open API Routes
    { route: '/api/open/users/',                                                                                                                         params: {                              context: { globalMiddleware: true                 } } },
    { route: '/api/open/users/[userId]/',                                                                                                                params: { userId: '1',                 context: { globalMiddleware: true                 } } },
    { route: '/api/open/users/[userId]/friends/',                                                                                                        params: { userId: '1',                 context: { globalMiddleware: true                 } } },
    { route: '/api/open/users/[userId]/blog-posts/',                                                                                                     params: { userId: '1',                 context: { globalMiddleware: true, blogPost: true } } },
    { route: '/api/open/users/[userId]/friends/[friendId]/blog-posts/',                                                                                  params: { userId: '1' , friendId: '2', context: { globalMiddleware: true, blogPost: true } } },
    { route: '/api/open/blog-posts/',                                                                                                                    params: {                              context: { globalMiddleware: true, blogPost: true } } },
    { route: '/api/open/blog-posts/[blogPostId]/',                                                                                                       params: { blogPostId: '1',             context: { globalMiddleware: true, blogPost: true } } },
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/employees/',                                                         params: { organizationId: '1', departmentId: '2' },                                          },
    // Closed API Routes
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/employees/[employeeId]/projects/',                                   params: { organizationId: '1', departmentId: '2', employeeId: '3' }                       },
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/employees/[employeeId]/tasks/',                                      params: { organizationId: '1', departmentId: '2', employeeId: '3' }                       },
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/subdepartments/[subDepartmentId]/employees/',                        params: { organizationId: '1', departmentId: '2', subDepartmentId: '4' }                  },
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/subdepartments/[subDepartmentId]/employees/[employeeId]/projects/',  params: { organizationId: '1', departmentId: '2', subDepartmentId: '4', employeeId: '5' } },
    { route: '/api/closed/organizations/[organizationId]/departments/[departmentId]/subdepartments/[subDepartmentId]/employees/[employeeId]/tasks/',     params: { organizationId: '1', departmentId: '2', subDepartmentId: '4', employeeId: '5' } },
    { route: '/api/closed/organizations/[organizationId]/clients/[clientId]/projects/',                                                                  params: { organizationId: '1', clientId: '6', context: { first: true, second: true } }    },
    { route: '/api/closed/organizations/[organizationId]/clients/[clientId]/contracts/',                                                                 params: { organizationId: '1', clientId: '6', context: { 'microMiddleware': true } }      },
  ]
  const allRouteTests = routeAndParams.flatMap((obj)=> methods.map(method => ({
    ...obj,
    method
  })))
  test.each(allRouteTests)(
    '$method $route should return 200',
    async ({ route, params, method }) => {
      // when you put [id] back into the above routes, you will need the following
      // const testUrl = route.replace(/:(\w+)/g, (_, param) => params[param]);
      // const response = await request(app)[method](testUrl);
      console.log(`${replaceRouteParams(route, params)}`)
      const response = await request(app)[method](replaceRouteParams(route, params))
      expect(response.status).toBe(200)
      console.log(JSON.stringify(response.body, null, 4))
      expect(response.body).toEqual({ route: convertPlaceholderFormat(route), params })
    }
  )
})
