import type {ComponentType} from 'react'
import type {EngineConfig} from './ModuleManagement/EngineConfig'
import type {ModulesGenerators, Module} from './ModuleManagement/Module'
import {makeEngineModuleRegistry} from './ModuleManagement/ModuleRegistry'
import type { EngineRegistry, Tabs, Modals } from './ModuleManagement/types'
import {atom} from './Atom/atom'
import {makePubSub} from './PubSub'
import {makeNavigator} from './Navigator'
import { cursor } from './Atom/cursor'
import { Atom } from './Atom/types'


export type EngineInitializer = {
  initEngine: <State extends Record<string, any> = Record<string, any>>(engineConfig: EngineConfig, modulesGenerators: ModulesGenerators<State>) => Promise<ComponentType>
}

const getGlobalId = (prefix: string, name: string) => `${prefix}.${name}`


export const makeRegisterModuleMethods = (engineRegistry: EngineRegistry) => (module: Module) => {
  const prefix = module.prefix()
  const methods = (module.methods?.() ?? {})
  Object.entries(methods).forEach(([name, methodGenerator]) => {
    engineRegistry.registerMethod(getGlobalId(prefix, name), methodGenerator)
  })
}

export const makeRegisterModuleComponents = (engineRegistry: EngineRegistry) => (module: Module) => {
  const prefix = module.prefix()
  const components = (module.components?.() ?? {})
  Object.entries(components).forEach(([name, generator]) => {
    engineRegistry.registerComponent(getGlobalId(prefix, name), generator)
  })
}

export const makeRegisterModuleScreens = (engineRegistry: EngineRegistry) => (module: Module) => {
  const prefix = module.prefix()
  const screens = (module.screens?.() ?? {})
  Object.entries(screens).forEach(([name, generator]) => {
    engineRegistry.registerScreen(getGlobalId(prefix, name), generator)
  })
}


export const makeEngineInitializer = (): EngineInitializer => {
  return {
    initEngine: async <State extends Record<string, any> = Record<string, any>>(engineConfig: EngineConfig, modulesGenerators: ModulesGenerators<State>) => {
      let globalAtom: Atom<State> | undefined = undefined
      const pubSub = makePubSub()
      const providePubSub = () => pubSub


      const provideAtom = () => {
        if (!globalAtom) {
          throw new Error(`Global atom is not initialized`)
        }
        return globalAtom
      }
      const engineRegistry = makeEngineModuleRegistry<State>(pubSub, provideAtom)
      const registerMethods = makeRegisterModuleMethods(engineRegistry)
      const registerComponents = makeRegisterModuleComponents(engineRegistry)
      const registerScreens = makeRegisterModuleScreens(engineRegistry)
      const provideModuleRegistry = () => engineRegistry.moduleRegistry
      
      const {state, modules} = Object.keys(modulesGenerators).reduce((acc, key) => {

        const generator = modulesGenerators[key]
        const { makeModule, makeInitialState } = generator()

        const _module = makeModule({
          provideModuleRegistry,
          providePubSub,
          provideAtom,
          provideLocalAtom: <LS>() => cursor<State, LS>(provideAtom(), [getKey()])
        })
        const getKey = () => _module.prefix()

        return {
          state: {
            ...acc.state,
            [_module.prefix()]: makeInitialState()
          },
          modules: {
            ...acc.modules,
            [_module.prefix()]: _module
          }
        }
      }, {state: {} as State, modules: {} as Record<string, Module>})

      globalAtom = atom(state)


      const tabs: Tabs = {}
      const modals: Modals = {}

      Object.keys(modules).forEach(moduleName => {
        const _module = modules[moduleName]
        registerMethods(_module)
        registerComponents(_module)
        registerScreens(_module)
        Object.entries(_module.modals?.() ?? {}).forEach(([name, modalGenerator]) => {
          const globalId = getGlobalId(_module.prefix(), name)
          if (modals[globalId]) {
            console.error(`Modal with id ${globalId} already registred`)
          }
          modals[globalId] = modalGenerator
        })

        Object.entries(_module.tabs?.() ?? {}).forEach(([name, tabGenerator]) => {
          const globalId = getGlobalId(_module.prefix(), name)
          if (tabs[globalId]) {
            console.error(`Tab with id ${globalId} already registred`)
          }
          tabs[globalId] = tabGenerator
        })
      })



      const RootComponent = makeNavigator(modals, tabs)

      return RootComponent
    }
  }
}

