const {makeAndroidBuilder} = require('./modules/AndroidBuilder')
const {configure} = require('./modules/Configurator')



const makeNativeBuilds = () => {
  let configured = false

  const _configure = () => {
    if (!configured) {
      configure()
      configured = true
    }
  }

  return {
    buildAndroid: (buildType) => {
      _configure()
      const androidBuilder = makeAndroidBuilder()
      androidBuilder(buildType)
    }
  }
}

module.exports = {
  NativeBuilds: makeNativeBuilds()
}