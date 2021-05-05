const {configure} = require('./Configurator')
const os = require('os')
const AndroidBuildVariant = require('../AndroidBuildVariant')
const execSync = require('child_process').execSync

const makeAndroidBuilder = () => {
  const repoDir = `${__dirname}/../../../../..`
  const engineAndroidDir = `${repoDir}/internal_folder/react-native-sbermarket-engine/android`

  const build = (buildType) => {
    const {config} = AndroidBuildVariant[buildType]
    const _i = os.platform() === 'darwin' ? `-i ''` : `-i`

    execSync(`sed ${_i} -e 's@"node_modules/react-native/local-cli/cli.js"@"../../node_modules/react-native/local-cli/cli.js"@' ${__dirname}/../../../../../node_modules/react-native/react.gradle`);
    execSync(`internal_folder/react-native-sbermarket-engine/android/gradlew \
      -Duser.dir=${__dirname}/../../../../../internal_folder/react-native-sbermarket-engine/android \
      app:assemble${config} \
      -DVERSION_CODE=1 \
      -DVERSION_NAME=999.999.999 \
    `, {stdio: 'inherit'})

    const destinationDir = `${repoDir}/internal_folder/react-native-sbermarket-engine/app_builds/android/${buildType}`
    

    execSync(`rm -rf ${destinationDir} && mkdir -p ${destinationDir}`)
    const app = `${engineAndroidDir}/app/build/outputs/apk/${config}/app-${config}.apk`
    const destinationApp = `${destinationDir}/Engine.apk`
    execSync(`cp -a ${app} ${destinationApp}`)
  }

  return build
}

module.exports = {
  makeAndroidBuilder
}