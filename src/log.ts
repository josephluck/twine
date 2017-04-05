export default {
  onReducerCalled (state, prev, name, ...args) {
    console.groupCollapsed(`🚀 Reducer: ${name}`)
    console.log('📦 prev:         ', prev)
    console.log.apply(this, ['⚡️ arguments:    '].concat(args))
    console.log('📦 state:        ', state)
    console.groupEnd()
  },
  onEffectCalled (state, name, ...args) {
    console.groupCollapsed(`🚀 Effect:  ${name}`)
    console.log('📦 state:         ', state)
    console.log.apply(this, ['⚡️ arguments:    '].concat(args))
    console.groupEnd()
  },
}
