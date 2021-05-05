import type {ComponentType} from 'react'
import type {EngineConfig} from './ModuleManagement/EngineConfig'
import type {ModulesGenerators, ModuleFactory, Module} from './ModuleManagement/Module'
import {makeEngineModuleRegistry} from './ModuleManagement/ModuleRegistry'
import type { EngineRegistry, Tabs, Modals } from './ModuleManagement/types'
import {atom} from './Atom/atom'
import {makePubSub} from './PubSub'
import {makeNavigator} from './Navigator'


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
			const {state, modulesFactories} = Object.keys(modulesGenerators).reduce((acc, key) => {
				const generator = modulesGenerators[key]
				const { makeModule, makeInitialState } = generator()
				return {
					state: {
						...acc.state,
						[key]: makeInitialState()
					},
					modulesFactories: {
						...acc.modulesFactories,
						[key]: makeModule
					}
				}

			}, {state: {} as State, modulesFactories: {} as Record<string, ModuleFactory<State>>})

			const globalAtom = atom(state)

			const provideAtom = () => globalAtom

			const pubSub = makePubSub()
			const providePubSub = () => pubSub

			const engineRegistry = makeEngineModuleRegistry<State>(pubSub, provideAtom)
			const registerMethods = makeRegisterModuleMethods(engineRegistry)
			const registerComponents = makeRegisterModuleComponents(engineRegistry)
			const registerScreens = makeRegisterModuleScreens(engineRegistry)
			const provideModuleRegistry = () => engineRegistry.moduleRegistry

			const tabs: Tabs = {}
			const modals: Modals = {}

			Object.keys(modulesFactories).forEach(moduleName => {
				const factory = modulesFactories[moduleName]
				const module = factory({ provideModuleRegistry: provideModuleRegistry, providePubSub: providePubSub, provideAtom })
				registerMethods(module)
				registerComponents(module)
				registerScreens(module)
				Object.entries(module.modals?.() ?? {}).forEach(([name, modalGenerator]) => {
					const globalId = getGlobalId(module.prefix(), name)
					if (modals[globalId]) {
						console.error(`Modal with id ${globalId} already registred`)
					}
					modals[globalId] = modalGenerator
				})

				Object.entries(module.tabs?.() ?? {}).forEach(([name, tabGenerator]) => {
					const globalId = getGlobalId(module.prefix(), name)
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

