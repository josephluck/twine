import * as Twine from './types'

export function onStateChange(plugins: Twine.Plugin[], state: any, prev: any, actions: any) {
  return plugins.map(plugin => {
    if (typeof plugin === 'function') {
      plugin(state, prev, actions)
    } else if (typeof plugin === 'object' && plugin.onStateChange) {
      plugin.onStateChange(state, prev, actions)
    }
  })
}

export function onReducerCalled(plugins: Twine.Plugin[], state: any, prev: any, name: any, args: any) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onReducerCalled) {
      plugin.onReducerCalled.apply(null, [state, prev, name].concat(args))
    }
  })
}

export function onEffectCalled(plugins: Twine.Plugin[], prev: any, name: any, args: any) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onEffectCalled) {
      plugin.onEffectCalled.apply(null, [prev, name].concat(args))
    }
  })
}

export function wrapReducer(plugins: Twine.Plugin[], reducer: Twine.ReducerImpl<any, any>) {
  return plugins.reduce((prev: Twine.ReducerImpl<any, any>, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapReducers) {
      return plugin.wrapReducers(prev)
    } else {
      return prev
    }
  }, reducer)
}

export function wrapEffect(plugins: Twine.Plugin[], effect: Twine.EffectImpl<any, any, any>) {
  return plugins.reduce((prev: Twine.EffectImpl<any, any, any>, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapEffects) {
      return plugin.wrapEffects(prev)
    } else {
      return prev
    }
  }, effect)
}
