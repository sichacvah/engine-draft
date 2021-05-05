const fetch = require('node-fetch')
const {sleep} = require('../utils/Sleep')

const PING_TIMEOUT = 100

const makePackageWatcher = (port, disabled) => {
  let waitingCallbacks = []
  let started = undefined

  const ping = async () => {
    try {
      await fetch(`http://localhost:${port}`);
      return true;
    } catch (ex) {
      if (ex.message.includes('ECONNREFUSED')) {
        return false;
      }
      throw ex;
    }
  }

  const validateDown = async () => disabled || !(await ping())
  const startWatchingUntilUp = async () => {
    if (disabled) return
    started = false

    while (!await ping()) {
      await sleep(PING_TIMEOUT)
    }
    started = true

    for (const callback of waitingCallbacks) {
      callback()
    }

    waitingCallbacks = []
  }

  const waitUntilUp = async () => {
    if (disabled) return

    if (started === undefined) {
      throw new Error('startWatchingUntilUp() should be called prior to waitUntilUp()')
    }

    if (started) return

    console.info('Waiting for the packager to respond..')
    return new Promise((resolve) => waitingCallbacks.push(resolve))
  }

  return {
    validateDown,
    startWatchingUntilUp,
    waitUntilUp
  }
}

module.exports = {
  makePackageWatcher
}
