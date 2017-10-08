import * as Types from './types'

function noop() {
  return null
}

function arrayToObj(curr, prev) {
  return Object.assign({}, curr, prev)
}

export function mergeState(model: Types.Model) {
  if (model.models) {
    let child = Object.keys(model.models)
      .map(key => ({
        [key]: mergeState(model.models[key]),
      }))
      .reduce(arrayToObj, {})

    const localState = Object.assign({}, model['state'], child)
    const computedState = model.computed ? model.computed(localState) : {}
    return Object.assign({}, localState, computedState)
  }
  const localState = model['state']
  const computedState = model.computed ? model.computed(localState) : {}
  return Object.assign({}, localState, computedState)
}

export function createState(model: Types.Model) {
  return mergeState(model)
}

export function retrieveNestedModel(model: Types.Model, path: string[], index: number = 0) {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export function getStateFromPath(state: Types.State, path: string[]) {
  if (path.length) {
    return getStateFromPath(state[path[0]], path.slice(1))
  }
  return state
}

export function updateStateAtPath(state: Types.State, path: string[], value: any) {
  if (path.length > 0) {
    let key = path[0]
    if (path.length > 1) {
      state[key] = updateStateAtPath(state[key], path.slice(1), value)
    } else {
      state[key] = value
    }
  }
  return state
}

export function recursivelyUpdateComputedState(
  model: Types.Model,
  state: Types.State,
  path: string[],
) {
  const currentModel = retrieveNestedModel(model, path)
  const currentState = getStateFromPath(state, path)
  const computedState = currentModel
    ? currentModel.computed ? currentModel.computed(currentState) : {}
    : model.computed ? model.computed(currentState) : {}
  if (path.length > 0) {
    const newState = updateStateAtPath(state, path, {
      ...currentState,
      ...computedState,
    })
    const newPath = path.slice(0, path.length - 1)
    return recursivelyUpdateComputedState(model, newState, newPath)
  } else {
    const newState = {
      ...currentState,
      ...computedState,
    }
    return newState
  }
}

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

export default function twine(model: Types.Model, opts?: Types.Opts) {
  if (!opts) {
    opts = noop
  }
  let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts]
  let state = createState(model)
  let actions = createActions(model, [])

  function decorateActions(
    reducers: Types.Model['reducers'],
    effects: Types.Model['effects'],
    path: string[],
  ) {
    const decoratedReducers = Object.keys(reducers || {}).map(key => {
      const reducer = reducers[key]
      const decoratedReducer = function() {
        // Call reducer & update the global state
        const currentModel = retrieveNestedModel(model, path) || model
        const previousState = Object.assign({}, state)
        const currentModelsState = path.length ? getStateFromPath(state, path) : previousState
        const reducerArgs = [currentModelsState].concat(Array.prototype.slice.call(arguments))
        const reducerResponse = reducer.apply(null, reducerArgs)
        const newState = Object.assign({}, currentModelsState, reducerResponse)
        state = path.length ? updateStateAtPath(state, path, newState) : newState
        state = recursivelyUpdateComputedState(model, state, path)

        // Plugins
        const pluginArgs = Array.prototype.slice.call(arguments)
        onReducerCalled(plugins, state, previousState, reducer.name, pluginArgs)
        onStateChange(plugins, state, previousState, actions)
        return path.length && currentModel.scoped
          ? Object.assign({}, currentModelsState, reducerResponse)
          : state
      }
      const wrappedReducer = wrapReducer(plugins, decoratedReducer)
      Object.defineProperty(wrappedReducer, 'name', { value: reducer.name })
      return { [key]: wrappedReducer }
    })
    const decoratedEffects = Object.keys(effects || {}).map(key => {
      const effect = effects[key]
      const decoratedEffect = function() {
        if (path.length) {
          const nestedModel = retrieveNestedModel(model, path)
          const effectState = nestedModel.scoped ? getStateFromPath(state, path) : state
          const effectActions = nestedModel.scoped ? getStateFromPath(actions, path) : actions
          const args = Array.prototype.slice.call(arguments)
          const effectArgs = [effectState, effectActions].concat(args)
          onEffectCalled(plugins, state, effect.name, args)
          return effects[key].apply(null, effectArgs)
        }
        const args = Array.prototype.slice.call(arguments)
        const effectArgs = [state, actions].concat(args)
        onEffectCalled(plugins, state, effect.name, args)
        return effects[key].apply(null, effectArgs)
      }
      const wrappedEffect = wrapEffect(plugins, decoratedEffect)
      Object.defineProperty(wrappedEffect, 'name', { value: effect.name })
      return { [key]: wrappedEffect }
    })
    return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
  }

  function createActions(model: Types.Model, path: string[]) {
    if (model.models) {
      const child = Object.keys(model.models)
        .map(key => ({
          [key]: createActions(model.models[key], path.concat(key)),
        }))
        .reduce(arrayToObj, {})
      return Object.assign({}, decorateActions(model.reducers, model.effects, path), child)
    }
    return decorateActions(model.reducers, model.effects, path)
  }

  return {
    state,
    actions,
  }
}
