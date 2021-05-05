import type {ComponentType} from 'react'
import type {EngineConfig} from './ModuleManagement/EngineConfig'
import type { ModulesGenerators } from './ModuleManagement/Module'
import {rootComponentWrapper} from './components/RootComponentWrapper'
import {LoadingComponent} from './components/LoadingComponent'
import {makeEngineInitializer} from './EngineInitializer'

export type AppRunner = {
  getRootComponent: () => ComponentType
  isAppLaunched: () => boolean
}


export type Params = {
  engineConfig: EngineConfig,
  modulesGenerators: ModulesGenerators
}

export const makeAppRunner = (params: Params): AppRunner => {
  const {engineConfig, modulesGenerators} = params

  let RootComponent: ComponentType | undefined = undefined


  return {
    isAppLaunched: () => Boolean(RootComponent),
    getRootComponent: () => {
      const getRootComponent = async () => {
        if (!RootComponent) {
          RootComponent = await makeEngineInitializer().initEngine(engineConfig, modulesGenerators)
        }
        return RootComponent
      }

      return rootComponentWrapper({getComponent: getRootComponent})
    }
  }

}
