import React from 'react'
import {AppRegistry, View} from 'react-native'
import {name as appName} from './app.json'

const engineConfig = require('../../engine_autogenerated/config')
import modulesGenerators from '../../engine_autogenerated/modules'
const {makeAppRunner} = require('./src/AppRunner')


console.log('MODULE_GENERATORS', modulesGenerators)


const appRunner = makeAppRunner({
	engineConfig,
	modulesGenerators
})


AppRegistry.registerComponent(appName, appRunner.getRootComponent);