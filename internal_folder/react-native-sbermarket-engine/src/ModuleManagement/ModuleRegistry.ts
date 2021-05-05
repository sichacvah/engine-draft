import type { MethodsGenerators } from './Module'
import {GlobalID, PubSub, EngineRegistry, Components, Screens} from './types'
import {Atom} from '../Atom/types'


export const makeEngineModuleRegistry = <GlobalState extends object = object>(pubSub: PubSub, atomProvider: () => Atom<GlobalState>): EngineRegistry<GlobalState> => {
  const registredComponents: Components = {}
  const registredMethods: MethodsGenerators = {}
  const registredScreens: Screens = {}

  const getComponent = (globalID: GlobalID) => {
    const generator = registredComponents[globalID]
    if (!generator) {
      console.error(`ModuleRegistry.component ${globalID} used but not yet registered`)
      return
    }

    return generator()
  }


  const invoke = <Args extends any[] = any[], Return = any>(globalID: GlobalID, ...args: Args) => {
    const generator = registredMethods[globalID]

    if (!generator) {
      console.error(`ModuleRegistry.invoke ${globalID} used but not yet registered`)
      return undefined
    }

    return generator(...args)
  }

  const hasMethod = (globalID: GlobalID) => {
    return Boolean(registredMethods[globalID])
  }

  const hasComponent = (globalID: GlobalID) => {
    return Boolean(registredComponents[globalID])
  }

  const hasScreen = (globalID: GlobalID) => {
    return Boolean(registredScreens[globalID])
  }

  const getScreen = (globalID: GlobalID) => {
    const generator = registredScreens[globalID]
    if (!generator) {
      console.error(`ModuleRegistry.getScreen ${globalID} used but not yet registred`)
      return 
    }

    return generator()
  }

  const moduleRegistry = {
    atom: atomProvider(),
    getComponent,
    invoke,
    hasMethod,
    hasComponent,
    pubSub,
    hasScreen,
    getScreen
  }

  return {
    moduleRegistry,
    registerScreen: (globalID, screenGenerator) => {
      if (hasScreen(globalID)) {
        console.error(`ModuleRegistry.registerScreen already has screen generator registred with id - ${globalID}`)
        return
      }
      registredScreens[globalID] = screenGenerator
    },
    registerMethod: (globalID, methodGenerator) => {
      if (hasMethod(globalID)) {
        console.error(`ModuleRegistry.registerMethod already has method generator registred with id - ${globalID}`)
        return
      }
      registredMethods[globalID] = methodGenerator
    },
    registerComponent: (globalID, generator) => {
      if (hasComponent(globalID)) {
        console.error(`ModuleRegistry.registerComponent already has component generator registred with id - ${globalID}`)
        return
      }
      registredComponents[globalID] = generator
    }
  }
}
