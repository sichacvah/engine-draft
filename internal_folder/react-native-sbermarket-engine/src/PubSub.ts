import {
  PubSub,
  SubscribtionFn,
  PubSubFactory
} from './ModuleManagement/types'


export const makePubSubFactory = (): PubSubFactory => {
  let subscribtions: Record<string, SubscribtionFn[]> = {}

  return (): PubSub => {

    return {
      publish: (event) => {
        const listeners = subscribtions[event.type] ?? []
        listeners.forEach(listener => {
          invokeSafely(listener, event)
        })
      },
      subscribe: (type, subscribtionFn) => {
        const currentListeners = subscribtions[type] ?? []
        subscribtions[type] = [...currentListeners, subscribtionFn]
        return () => {
          const nextListenrs = (subscribtions[type] ?? []).filter(l => l !== subscribtionFn)
          subscribtions[type] = nextListenrs
          if (nextListenrs.length === 0) {
            delete subscribtions[type]
          }
        }
      }
    }
  }
}

export const makePubSub = makePubSubFactory()


const invokeSafely = (callback: Function, args: any[]) => {
  try {
    callback(...args);
  } catch (err) {
    console.error(err);
  }
}