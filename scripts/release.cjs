/**
 * modified from https://github.com/vuejs/vue-next/blob/master/scripts/release.js
 */
const path = require('path')
const fs = require('fs')
const spawn = require('cross-spawn')
const args = require('minimist')(process.argv.slice(2))
const semver = require('semver')
const colors = require('picocolors')
const { prompt } = require('enquirer')

const name = 'vite-plugin-turbo-reload'

const isRubyLibrary = name !== 'vite-plugin-ruby'
const pkg = jsPackage()

/**
 * @type {boolean}
 */
const isDryRun = args.dry
/**
 * @type {boolean}
 */
const skipBuild = args.skipBuild || isRubyLibrary

/**
 * @type {import('semver').ReleaseType[]}
 */
const versionIncrements = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]

/**
 * @param {import('semver').ReleaseType} i
 */
function inc (i) {
  return semver.inc(pkg.version, i)
}

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {object} opts
 */
function run (bin, args, opts = {}) {
  return spawn.sync(bin, args, { stdio: 'inherit', ...opts })
}

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {object} opts
 */
function dryRun (bin, args, opts = {}) {
  console.log(colors.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
}

/**
 * @param {string} msg
 */
function step (msg) {
  console.log(colors.cyan(msg))
}

/**
 * @param {string} paths
 */
function resolve (paths) {
  return path.resolve(__dirname, `../${paths}`)
}

function jsPackage () {
  const path = resolve('package.json')
  const content = fs.readFileSync(path, 'utf-8')
  return {
    type: 'package',
    path,
    content,
    ...require(path),
    updateVersion (version) {
      const newContent = { ...JSON.parse(content), version }
      fs.writeFileSync(path, `${JSON.stringify(newContent, null, 2)}\n`)
    },
  }
}

async function main () {
  const runIfNotDry = isDryRun ? dryRun : run

  /**
   * @type {{ release: string }}
   */
  const { release } = await prompt({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: versionIncrements
      .map(i => `${i} (${inc(i)})`)
      .concat(['custom']),
  })

  let targetVersion
  if (release === 'custom') {
    /**
     * @type {{ version: string }}
     */
    const res = await prompt({
      type: 'input',
      name: 'version',
      message: 'Input custom version',
      initial: pkg.version,
    })
    targetVersion = res.version
  }
  else {
    targetVersion = release.match(/\((.*)\)/)[1]
  }

  if (!semver.valid(targetVersion))
    throw new Error(`invalid target version: ${targetVersion}`)

  const tag = `${name}@${targetVersion}`

  /**
   * @type {{ yes: boolean }}
   */
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${tag}. Confirm?`,
  })

  if (!yes)
    return

  step(`\nUpdating ${pkg.type} version...`)
  pkg.updateVersion(targetVersion)

  step(`\nBuilding ${pkg.type}...`)
  if (!skipBuild && !isDryRun)
    run('pnpm', ['build'], { cwd: resolve('.') })
  else
    console.log('(skipped)')

  step('\nGenerating changelog...')
  runIfNotDry('pnpm', ['changelog', name])

  const { stdout } = run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    runIfNotDry('git', ['add', '-A'])
    runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
  }
  else {
    console.log('No changes to commit.')
  }

  step(`\nPublishing ${pkg.type}...`)
  await publishPackage(targetVersion, runIfNotDry)

  step('\nPushing to GitHub...')
  runIfNotDry('git', ['push'])

  if (isDryRun)
    console.log(`\nDry run finished - run git diff to see ${pkg.type} changes.`)

  console.log()
}

/**
 * @param {string} version
 * @param {Function} runIfNotDry
 */
async function publishPackage (version, runIfNotDry) {
  try {
    runIfNotDry('pnpm', ['publish'], {
      stdio: 'inherit',
      cwd: resolve('.'),
    })
    console.log(colors.green(`Successfully published ${name}@${version}`))
  }
  catch (e) {
    if (e.stderr.match(/previously published/))
      console.log(colors.red(`Skipping already published: ${name}`))
    else
      throw e
  }
}

main().catch((err) => {
  console.error(err)
})
