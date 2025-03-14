const {join} = require('path')
const { writeFileSync, readFileSync} = require('fs')

const { readContents, injectFileFencePosts, injectCodeFencePosts, injectToc } = require('@psenger/markdown-fences')
const toc = require('markdown-toc')
const licenseChecker = require('license-checker')

const StringReplacer = require('./string-replacer')
const {devDependencies, dependencies, version, description, homepage} = require('../package.json')

const PATHS = {
  root: join(__dirname, '..'),
  thirdPartyNotice: join(__dirname, '..', 'THIRD_PARTY_NOTICES.md'),
  readmeDraft: join(__dirname, '..', '.README.md'),
  readme: join(__dirname, '..', 'docs', 'README.md'),
  sourceFiles: join(__dirname, '..', 'src', '*.js')
}

const createItemTemplate = ({name, repository, licenses}) =>
  `\n- [${name}](${repository}) - ${licenses} License`

const createTemplate = (depth = 0, {dependencies = [], developmentDependencies = []} = { dependencies: [], developmentDependencies: [] }) => `
${'#'.repeat(depth)} Acknowledgments

This project directly uses the following open-source packages:

${'#'.repeat(depth)}# Dependencies
${dependencies.length ? dependencies.map(createItemTemplate).join('') : '\n- None'}

${'#'.repeat(depth)}# Development Dependencies
${developmentDependencies.length ? developmentDependencies.map(createItemTemplate).join('') : '\n- None'}
`

const parseModuleName = key => {
  if (key.startsWith('@')) {
    const scopedParts = key.split('@')
    return `@${scopedParts[1]}`
  }
  return key.split('@')[0]
}

const categorizeModules = (dependenciesObj, devMod, prodMod) => {
  const categorizedModules = Object
    .entries(dependenciesObj)
    .reduce((acc, [key, value]) => {
      const moduleName = parseModuleName(key)
      const moduleData = {...value, name: moduleName}

      if (devMod.has(moduleName)) {
        acc.developmentDependencies[moduleName] = moduleData
      } else if (prodMod.has(moduleName)) {
        acc.dependencies[moduleName] = moduleData
      }

      return acc
    }, {dependencies: {}, developmentDependencies: {}})

  return {
    dependencies: Object.values(categorizedModules.dependencies),
    developmentDependencies: Object.values(categorizedModules.developmentDependencies)
  }
}

const initLicenseChecker = (findModules, devModules, prodModules, outputFile) =>
  new Promise((resolve, reject) => {
    licenseChecker.init({
      start: PATHS.root
    }, (err, packages) => {
      if (err) return reject(err)

      const results = findModules(packages, devModules, prodModules)

      writeFileSync(outputFile, createTemplate(2, results), {encoding: 'utf8'})
      resolve(results)
    })
  })

const compose = (...fns) => args => fns.reduce((p, f) => p.then(f), Promise.resolve(args))

const generateMarkDownFile = async (markdownFile, baseDir, indexes, options) => {
  const closureInjectFileFencePosts = (baseDir, options) => async (markdownContent) => injectFileFencePosts(markdownContent, baseDir, options);
  const closureInjectCodeFencePosts = (baseDir, options) => async (markdownContent) => injectCodeFencePosts(markdownContent, baseDir, options);
  return await compose(
    readContents,
    closureInjectFileFencePosts(baseDir, options),
    closureInjectCodeFencePosts(baseDir, options),
    injectToc
  )(markdownFile)
}

const generateReadme = async () => {

  const markdown = await generateMarkDownFile(
    PATHS.readmeDraft,
    PATHS.root,
    [PATHS.sourceFiles],
    {'heading-depth': 3}
  )
  const updatedMarkdown = toc.insert(
    new StringReplacer( markdown.toString() )
      .replace(/<!-- pkg.homepage -->/, homepage)
      .replace(/<!-- pkg.description -->/, description)
      .replace(/<!-- pkg.version -->/, version)
      .replace(/<!-- pkg.version -->/, version)
      .replace(/<!--START_SECTION:file:HOWITWORKS\.md-->[\s\S]*?<!--END_SECTION:file:HOWITWORKS\.md-->/g,'')
      .replace(/<!--START_SECTION:file:USAGE\.md-->[\s\S]*?<!--END_SECTION:file:USAGE\.md-->/g,'')
      .toString()
  )
  await writeFileSync(PATHS.readme, updatedMarkdown, 'utf8')
}

const run = async () => {
  const devModulesDirectlyUsed = new Set(Object.keys(devDependencies || {}))
  const prodModulesDirectlyUsed = new Set(Object.keys(dependencies || {}))

  await initLicenseChecker(
    categorizeModules,
    devModulesDirectlyUsed,
    prodModulesDirectlyUsed,
    PATHS.thirdPartyNotice
  )

  await generateReadme()
}

// Error handling
run()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
