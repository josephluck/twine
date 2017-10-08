import * as Types from './types'

export function onStateChange(plugins: Types.Plugin[], state, prev, actions) {
  return plugins.map(plugin => {
    if (typeof plugin === 'function') {
      plugin(state, prev, actions)
    } else if (typeof plugin === 'object' && plugin.onStateChange) {
      plugin.onStateChange(state, prev, actions)
    }
  })
}

export function onReducerCalled(plugins, state, prev, name, args) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onReducerCalled) {
      plugin.onReducerCalled.apply(null, [state, prev, name].concat(args))
    }
  })
}

export function onEffectCalled(plugins, prev, name, args) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onEffectCalled) {
      plugin.onEffectCalled.apply(null, [prev, name].concat(args))
    }
  })
}

export function wrapReducer(plugins, reducer) {
  return plugins.reduce((prev, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapReducers) {
      return plugin.wrapReducers(prev)
    } else {
      return prev
    }
  }, reducer)
}

export function wrapEffect(plugins, effect) {
  return plugins.reduce((prev, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapEffects) {
      return plugin.wrapEffects(prev)
    } else {
      return prev
    }
  }, effect)
}
