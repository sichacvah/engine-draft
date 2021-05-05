const fs = require('fs')
const childProcess = require('child_process')

const asyncExec = (cmd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (error, stdout) => {
      if (error) return reject(error)
      resolve(stdout)
    })
  })
}


const PackageId = {
  dev: 'com.engine.debug',
  staging: 'com.engine.staging',
  release: 'com.engine',
}

const getBootedDevices = (adb) => {
  const output = childProcess.execSync(
    `${adb} devices | tail -n +2 | cut -sf 1`,
  );
  return String(output)
    .trim()
    .split('\n')
}

const uninstallApp = async (adb, device, packageId) => {
  const stdout  = await asyncExec(
    `${adb} -s ${device} shell pm list packages`,
  )

  if (!stdout.match(new RegExp(`:${packageId}\\n`))) {
    console.info(
      `The package ${packageId} is not installed, skipping uninstallation`
    )
    return
  }
  console.info(`Uninstalling from android device ${device}`);
  await asyncExec(`${adb} -s ${device} uninstall ${packageId}`)
}

const buildApp = (buildType) => {
  const {NativeBuilds} = require('../../../native_builds/index')
  NativeBuilds.buildAndroid(buildType)
}

const buildAppIfNotExists = (engineDir, buildType) => {
  const appPath = `${engineDir}/app_builds/android/${buildType}/Engine.apk`
  if (!fs.existsSync(appPath)) {
    console.info(
      `Binary of ${buildType} is not available at ${appPath}, Building it.....`,
    )
    buildApp(buildType)
  }
  return appPath
}

const installApp = async (adb, device, engineDir, buildType) => {
  const appPath = buildAppIfNotExists(engineDir, buildType)

  console.info(`Installing on android device ${device}`)
  await asyncExec(`${adb} -s ${device} install -r ${appPath}`)
}

const permitOverlay = async (adb, device, packageId) => {
  console.info(`Granting permissions for overlay on the device ${device}`)
  await asyncExec(
    `${adb} -s ${device} shell pm grant ${packageId} android.permission.SYSTEM_ALERT_WINDOW`
  )
}

const launchApp = async (adb, device, packageId) => {
  console.info(`Launching app ${packageId} on device ${device}`)
  await asyncExec(
    `${adb} -s ${device} shell monkey -p ${packageId} -c android.intent.category.LAUNCHER 1`
  )
}

const makeAndroidRunner = (packagerWatcher) => {

  if (!process.env.ANDROID_HOME) {
    throw new Error('ANDROID_HOME is undefined')
  }

  const adb = `${process.env.ANDROID_HOME}/platform-tools/adb`

  const run = async (engineDir, buildType, disableUninstall) => {
    const devices = getBootedDevices(adb)

    const packageId = PackageId[buildType]

    await Promise.all(devices.map(async (device) => {
      if (device === '') return
      if (!disableUninstall) {
        await uninstallApp(adb, device, packageId);
      }
      await installApp(adb, device, engineDir, buildType)
      await packagerWatcher.waitUntilUp()
      await launchApp(adb, device, packageId)
    }))
  }
  return run
}

module.exports = {
  makeAndroidRunner
}

