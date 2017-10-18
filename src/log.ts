export default {
  onReducerCalled(nextState: any, previousState: any, name: string, params: any) {
    console.groupCollapsed(`✨ Reducer: ${name}`)
    console.log('📦 previous state:  ', previousState)
    console.log('⚡️ arguments:        ', params)
    console.log('📦 next state:      ', nextState)
    console.groupEnd()
  },
  onEffectCalled(state: any, name: string, params: any) {
    console.groupCollapsed(`🚀 Effect:  ${name}`)
    console.log('📦 state:           ', state)
    console.log('⚡️ arguments:        ', params)
    console.groupEnd()
  },
}
