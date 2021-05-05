import React from 'react'
import {View, StyleSheet, Text, Alert, Button} from 'react-native'
import {Module, ModuleParams, MakeModuleGenerator} from '../../internal_folder/react-native-sbermarket-engine/src/ModuleManagement/Module'

const PREFIX = 'demo-module-a'

export type State = {
	'demo-module-a': object
}

type Params = ModuleParams<State>

const makeMainScreen = ({provideModuleRegistry}: Params) => () => {
	const moduleRegistry = provideModuleRegistry()
	return (
		<View style={styles.container}>
			<Text>Demo module A</Text>
			<Button
        title="Say Hello to module B"
        onPress={() => moduleRegistry.invoke('demo-module-b.alert')}
      />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
 		justifyContent: 'center',
  	alignItems: 'center',
  	backgroundColor: 'orange'
	},

})


const makeInitialState = () => ({})
const makeModule = (params: Params): Module => {
	return {
		prefix: () => PREFIX,
		methods: () => ({
			alert: () => {
				Alert.alert(`Alert from module ${PREFIX}`)
			}
		}),
		tabs: () => {
			const MainScreen = makeMainScreen(params)
			return {
				main: () => ({
					name: 'Main',
					component: MainScreen
				})
			}
		}
	}
}

const makeModuleGenerator: MakeModuleGenerator<State> = () => ({
	makeModule,
	makeInitialState
})

export default makeModuleGenerator()
