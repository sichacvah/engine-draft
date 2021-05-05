
const {ArgumentParser} = require('argparse')
const fs = require('fs')
const {makePackageWatcher} = require('./runners/PackageWatcher')
const {makeAsyncPackagerRunner} = require('./runners/AsyncPackagerRunner')
const { generateConfig } = require('./GenerateConfigure')
const BuildType = require('../../native_builds/BuildType')
const {makeAndroidRunner} = require('./runners/AndroidRunner')


const parseArgs = () => {
  const parser = new ArgumentParser()

  parser.addArgument(['-a', '--run-android'], {
    help: 'uninstall, install and run the app on connected Android devices',
    action: 'storeTrue',
  })

  parser.addArgument(['-U', '--disable-uninstall'], {
    help:
      'when used with -i or -a, this option prevents uninstallation of the app from the device; ' +
      'this means that you will get the old session',
    action: 'storeTrue',
  })

  parser.addArgument(['-n', '--native-build-type'], {
    defaultValue: BuildType.dev,
    choices: Object.values(BuildType),
    help: 'native build type to install',
  })

  parser.addArgument(['-p', '--custom-config-json'], {
    help:
      'path to configuration json (the default is package.json in the current dir)',
  })

  parser.addArgument(['-P', '--no-packager'], {
    help: "Don't start the packager",
    action: 'storeTrue',
  })

  parser.addArgument(['--reset-cache'], {
    help: 'Reset packager cache',
    action: 'storeTrue',
  })

  parser.addArgument(['--packager-port'], {
    help: 'Port to run the packager on',
    defaultValue: '8081',
  })

  parser.addArgument('ignored', {isPositional: true, nargs: '*'})
  return parser.parseArgs()
}

const run = async (args) => {
  let packagerProcess
  try {
    const engineDir = `${__dirname}/../../..`
    const configParams = {
      root_path: `${engineDir}/../..`,
      package_json_path: args.custom_config_json || `${process.cwd()}/package.json`,
      watch: false,
      force_localhost: args.force_localhost
    }
    generateConfig({
      root_path: `${engineDir}/../..`,
      package_json_path: args.custom_config_json || `${process.cwd()}/package.json`,
      watch: false,
      force_localhost: args.force_localhost
    })
    const packageWatcher = makePackageWatcher(args.packager_port, args.no_packager)
    if (!(await packageWatcher.validateDown())) {
      console.error(
        "Detected packager running, can't run another one. " +
          'If you intentionally started it separately, use the -P option. ' +
          `To run the running packager process, use 'lsof -i :${
            args.packager_port
          }'.`,
      );
      process.exit();
    }

    packageWatcher.startWatchingUntilUp()
    if (!args.no_packager) {
      packagerProcess = makeAsyncPackagerRunner(
        engineDir,
        args.reset_cache,
        args.packager_port,
      )
    }

    if (args.run_android) {
      const run = makeAndroidRunner(packageWatcher)
      await run(engineDir, args.native_build_type, args.disable_uninstall)
    }

  } catch (error) {
    console.error(error)
    packagerProcess && packagerProcess.kill()
    process.exit(1)
  }
}

module.exports = {
  run,
  parseArgs
}