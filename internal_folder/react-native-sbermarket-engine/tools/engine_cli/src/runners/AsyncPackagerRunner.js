const childProcess = require('child_process')


const makeAsyncPackagerRunner = (
  engineDir,
  resetCache,
  port
) => {
  const rnStartCmdArray = [
    'node',
    'node_modules/react-native/local-cli/cli.js',
    'start',
    '--port',
    port,
    engineDir 
  ]

  if (resetCache) {
    rnStartCmdArray.push('--reset-cache')
  }

  const cwd = `${engineDir}/../..`
  const cmdStr = `cd ${cwd} ${rnStartCmdArray.join(' ')}`
  console.info(`Running in background: ${cmdStr}`)

  const packager = childProcess.spawn(
    rnStartCmdArray[0],
    rnStartCmdArray.slice(1),
    {
      cwd,
      stdio: 'inherit',
    }
  )

  packager.on('exit', () => console.info(`The packager process finished`))

  return packager
}

module.exports = {
  makeAsyncPackagerRunner
}