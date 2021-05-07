import { Atom, ReadonlyAtom } from '../Atom/types'
import { ModalGenerator, TabGenerator, ScreenGenerator, ComponentGenerator, MethodGenerator, ModuleRegistry, PubSub } from './types'

export type ModuleParams<GlobalState extends Record<string, any> = Record<string, any>> = {
  providePubSub: () => PubSub
  provideAtom: () => ReadonlyAtom<GlobalState>
  provideLocalAtom: <LocalState>() => Atom<LocalState>
  provideModuleRegistry: () => ModuleRegistry<GlobalState>
}

export type ModuleFactory<GlobalState extends Record<string, any>> = (params: ModuleParams<GlobalState>) => Module

export type GetModuleInitialState<Key extends string, S extends Record<string, any> = Record<string, any>> = () => S[Key]

export type ModuleGenerator<GlobalState extends Record<string, any> = Record<string, any>> = {
  makeModule: ModuleFactory<GlobalState>
  makeInitialState: GetModuleInitialState<string, GlobalState>
}

export type MakeModuleGenerator<GlobalState extends Record<string, any> = Record<string, any>> = () => ModuleGenerator<GlobalState>


export type ModulesGenerators<GlobalState extends Record<string, any> = Record<string, any>> = {
  [key: string]: MakeModuleGenerator<GlobalState>
}

export type MethodsGenerators = Record<string, MethodGenerator> 

export type Module = {
  prefix: () => string
  methods?: () => Record<string, MethodGenerator>
  components?: () => Record<string, ComponentGenerator>
  screens?: () => Record<string, ScreenGenerator>
  modals?:  () => Record<string, ModalGenerator>
  tabs?:    () => Record<string, TabGenerator>
}
