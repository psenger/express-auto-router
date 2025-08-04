const fs = require('fs')
const path = require('path')
const os = require('os')

function createTempDir(prefix = 'test-routes-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function createRouteFile(dir, filename, content) {
  fs.writeFileSync(path.join(dir, filename), content)
}

function createRouteDir(basePath, dirName) {
  const fullPath = path.join(basePath, dirName)
  fs.mkdirSync(fullPath, { recursive: true })
  return fullPath
}

function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function createBasicRoute(content = 'module.exports = (router) => { router.get((req, res) => res.json({})); return router }') {
  return content
}

function createBasicMiddleware(content = 'module.exports = () => [(req, res, next) => next()]') {
  return content
}

module.exports = {
  createTempDir,
  createRouteFile,
  createRouteDir,
  cleanupTempDir,
  createBasicRoute,
  createBasicMiddleware
}