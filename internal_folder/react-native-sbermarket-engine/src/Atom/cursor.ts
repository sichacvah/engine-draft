import R from 'ramda'
import {Atom, Listener, IDisposable} from './types'

export const cursor = <S extends object, T>(
  source: Atom<S>,
  path: (string | number)[],
): Atom<T> & IDisposable => {
  const extract = (obj: S): T => R.path(path, obj) as T
  let listeners = [] as Listener<T>[]
  const universalListener: Listener<S> = (n, p) => {
    const next = extract(n)
    const prev = extract(p)

    if (next === prev) {
      return
    }
    listeners.forEach((listener) => {
      listener(next, prev)
    })
  }
  const thisAtom: Atom<T> & IDisposable = {
    dispose: () => {
      source.removeListener(universalListener)
      listeners = []
    },
    listenersCount: () => listeners.length,
    toString: () => `Cursor(path=${path}, ${JSON.stringify(thisAtom.deref())})`,
    addListener: (listener) => {
      if (listeners.length === 0) {
        source.addListener(universalListener)
      }
      listeners.push(listener)
      return thisAtom
    },
    removeListener: (listener) => {
      listeners = listeners.filter((l) => l !== listener)
      if (listeners.length === 0) {
        source.removeListener(universalListener)
      }
      return thisAtom
    },
    deref: () => extract(source.deref()),
    swap: (fn, ...args) => {
      source.swap((state, ...rest) => {
        const next = R.assocPath(path, fn(extract(state), ...rest), state)
        return next
      }, ...args)
      return thisAtom
    },
    reset: (next: T) => {
      const current = source.deref()
      source.reset(R.assocPath(path, next, current))
      return thisAtom
    },
  }
  return thisAtom
}