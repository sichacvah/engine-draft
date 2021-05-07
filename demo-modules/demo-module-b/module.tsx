import React from 'react'
import {View, StyleSheet, Text, Alert, Button} from 'react-native'
import {Module, ModuleParams, MakeModuleGenerator} from '../../internal_folder/react-native-sbermarket-engine/src/ModuleManagement/Module'

const PREFIX = 'demo-module-b'

export type State = {
  'demo-module-b': object
}

type Params = ModuleParams<State>

const makeMainScreen = ({provideModuleRegistry}: Params) => () => {
  const moduleRegistry = provideModuleRegistry()
  return (
    <View style={styles.container}>
      <Text>Demo module B</Text>
      <Button
        title="Say Hello to module A"
        onPress={() => moduleRegistry.invoke('demo-module-a.alert')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  },

})


const makeInitialState = () => ({})
const makeModule = (params: Params): Module => {
  return {
    prefix: () => PREFIX,
    methods: () => ({
      alert: () => () => {
        Alert.alert(`Alert from module ${PREFIX}`)
      }
    }),
    tabs: () => {
      const MainScreen = makeMainScreen(params)
      return {
        main: () => ({
          name: 'BScreen',
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
