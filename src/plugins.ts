import Twine from './types'

export function onStateChange<S, A>(
  plugins: Twine.Plugin<S, A>[],
  state: any,
  prev: any,
  actions: any,
) {
  return plugins.map(plugin => {
    if (typeof plugin === 'function') {
      plugin(state, prev, actions)
    } else if (typeof plugin === 'object' && plugin.onStateChange) {
      plugin.onStateChange(state, prev, actions)
    }
  })
}

export function onReducerCalled<S, A>(
  plugins: Twine.Plugin<S, A>[],
  state: any,
  prev: any,
  name: any,
  args: any,
) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onReducerCalled) {
      plugin.onReducerCalled.apply(null, [state, prev, name].concat(args))
    }
  })
}

export function onEffectCalled<S, A>(
  plugins: Twine.Plugin<S, A>[],
  prev: any,
  name: any,
  args: any,
) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onEffectCalled) {
      plugin.onEffectCalled.apply(null, [prev, name].concat(args))
    }
  })
}

export function wrapReducer<S, A>(
  plugins: Twine.Plugin<S, A>[],
  reducer: Twine.ReducerApi<any, any>,
) {
  return plugins.reduce((prev: Twine.ReducerApi<any, any>, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapReducers) {
      return plugin.wrapReducers(prev)
    } else {
      return prev
    }
  }, reducer)
}

export function wrapEffect<S, A>(plugins: Twine.Plugin<S, A>[], effect: Twine.EffectApi<any, any>) {
  return plugins.reduce((prev: Twine.EffectApi<any, any>, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapEffects) {
      return plugin.wrapEffects(prev)
    } else {
      return prev
    }
  }, effect)
}
