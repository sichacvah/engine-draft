import {ReadonlyAtom, Listener} from './types'

/**
 * 
 * @param sources 
 * @param selector 
 * @returns 
 */
export const derivedAtom = <Result>(sources: ReadonlyAtom<unknown>[] | ReadonlyAtom<unknown>, selector: (...args: unknown[]) => Result): ReadonlyAtom<Result> => {
  
  const _sources = Array.isArray(sources) ? sources : [sources]
  const getCurrentValues = () => _sources.map(source => source.deref())
  const getValue = () => selector(...getCurrentValues())
  let currentValue = getValue()

  let listeners: Listener<Result>[] = []
  const commonListener = () => {
    const value = getValue()
    if (value === currentValue) return
    listeners.forEach((listener) => {
      listener(value, currentValue)
    })
    currentValue = value
  }

  const a: ReadonlyAtom<Result> = {
    deref: () => {
      // recompute value only on deref if we have 0 listeners
      if (listeners.length === 0) {
        currentValue = getValue()
      }
      return currentValue
    },
    addListener: (listener) => {
      if (listeners.length === 0) {
        _sources.forEach(source => source.addListener(commonListener))
      }

      listeners.push(listener)
      return a
    },
    removeListener: (listener) => {
      listeners = listeners.filter(l => l !== listener)
      if (listeners.length === 0) {
        _sources.forEach(source => source.removeListener(commonListener))
      }
      return a
    },
    listenersCount: () => listeners.length
  }

  return a
}
