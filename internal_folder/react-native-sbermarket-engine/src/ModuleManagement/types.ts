import type { ComponentType } from 'react'
import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs'
import type { StackNavigationOptions } from '@react-navigation/stack'
import type {Atom} from '../Atom/types'


export type ModuleRegistry<GlobalState = any> = {
  provideAtom: () => Atom<GlobalState>
  getComponent: (globalID: GlobalID) => ComponentType<any> | undefined
  getScreen: (globalID: GlobalID) => Screen | undefined
  hasScreen: (globalID: GlobalID) => boolean
  invoke: InvokeFn
  hasMethod: (globalID: GlobalID) => boolean
  pubSub: PubSub
  hasComponent: (globalID: GlobalID) => boolean
}

export type InvokeFn = <Args extends any[] = any[], Return = any>(globalID: GlobalID, ...args: Args) => Return
export type ModuleMethod = Function
export type MethodGenerator = () => ModuleMethod

export type EngineRegistry<GlobalState = any> = {
  moduleRegistry: ModuleRegistry<GlobalState>
  registerScreen: (globalID: GlobalID, screenGenerator: ScreenGenerator) => void
  registerComponent: (globalID: GlobalID, generator: ComponentGenerator) => void
  registerMethod: (globalID: GlobalID, methodGenerator: MethodGenerator) => void
}

export type ComponentGenerator = <T = any>() => ComponentType<T>


export type Tab = {
  options?: BottomTabNavigationOptions
  name: string
  component: ComponentType
}

export type Modal = {
  options?: StackNavigationOptions
  name: string
  component: ComponentType
}

export type Screen = {
  options?: StackNavigationOptions
  name: string
  component: ComponentType
}

export type ScreenGenerator = () => Screen
export type ModalGenerator = () => Modal
export type TabGenerator = () => Tab

export type Components = Record<GlobalID, ComponentGenerator>
export type Modals = Record<GlobalID, ModalGenerator>
export type Tabs = Record<GlobalID, TabGenerator>
export type Screens = Record<GlobalID, ScreenGenerator>


export type GlobalID = string

export type Event<Payload> = {
  type: GlobalID,
  payload: Payload
}


export type SubscribtionFn = <Payload>(event: Event<Payload>) => void
export type Unsubscribe = () => void

export type PublishEvent = <Payload>(event: Event<Payload>) => void
export type SubscribeToEvent = (type: string, subscribtionFn: SubscribtionFn) => Unsubscribe


export type PubSub = {
  publish: PublishEvent,
  subscribe: SubscribeToEvent
}

export type PubSubFactory = () => PubSub


