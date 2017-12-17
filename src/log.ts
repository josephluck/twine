import Twine from './types'

export interface Log {
  onReducerCalled: Twine.OnReducerCalled<any>
  onEffectCalled: Twine.OnEffectCalled<any>
}

const log: Log = {
  onReducerCalled(nextState, previousState, name, params) {
    console.groupCollapsed(`✨ Reducer: ${name}`)
    console.log('📦 previous state:  ', previousState)
    if (params) {
      console.log('⚡️ arguments:        ', params)
    }
    console.log('📦 next state:      ', nextState)
    console.groupEnd()
  },
  onEffectCalled(state, name, params) {
    console.groupCollapsed(`🚀 Effect:  ${name}`)
    console.log('📦 state:           ', state)
    if (params) {
      console.log('⚡️ arguments:        ', params)
    }
    console.groupEnd()
  },
}

export default log
