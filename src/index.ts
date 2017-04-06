export type Subscriber = (state: State, prev: State, actions: any) => any
export type OnReducerCalled = (state: State, prev: State, name: string, ...args: any[]) => any
export type OnEffectCalled = (prev: State, name: string, ...args: any[]) => any

export type Plugin = Subscriber | {
  onStateChange?: Subscriber,
  onReducerCalled?: OnReducerCalled,
  onEffectCalled?: OnEffectCalled,
}

export type Opts = Plugin | Plugin[]

export interface Model {
  state?: any
  computed?: (state) => any
  scoped?: boolean
  reducers?: {
    [key: string]: (state: any, ...args: any[]) => any,
  }
  effects?: {
    [key: string]: (state: any, actions: any, ...args: any[]) => any,
  }
  models?: {
    [key: string]: Model,
  }
}

export interface State {
  [key: string]: State | any
}

function noop () {
  return null
}

function arrayToObj (curr, prev) {
  return Object.assign({}, curr, prev)
}

export function merge (model: Model, prop: string) {
  if (model.models) {
    let child = Object.keys(model.models).map(key => ({
      [key]: merge(model.models[key], prop),
    })).reduce(arrayToObj, {})

    return Object.assign({}, model[prop], child)
  }
  return model[prop]
}

export function createState (model: Model) {
  return merge(model, 'state')
}

export function retrieveNestedModel (model: Model, path: string[], index: number = 0) {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export function getNestedObjFromPath (state: State, path: string[]) {
  if (path.length) {
    return getNestedObjFromPath(state[path[0]], path.slice(1))
  }
  return state
}

export function updateStateAtPath (state: State, path: string[], value: any) {
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

export function onStateChange (plugins: Plugin[], state, prev, actions) {
  return plugins.map(plugin => {
    if (typeof plugin === 'function') {
      plugin(state, prev, actions)
    } else if (typeof plugin === 'object' && plugin.onStateChange) {
      plugin.onStateChange(state, prev, actions)
    }
  })
}

export function onReducerCalled (plugins, state, prev, name, args) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onReducerCalled) {
      plugin.onReducerCalled.apply(null, [state, prev, name].concat(args))
    }
  })
}

export function onEffectCalled (plugins, prev, name, args) {
  return plugins.map(plugin => {
    if (typeof plugin === 'object' && plugin.onEffectCalled) {
      plugin.onEffectCalled.apply(null, [prev, name].concat(args))
    }
  })
}

export function wrapReducer (plugins, reducer) {
  return plugins.reduce((prev, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapReducers) {
      return plugin.wrapReducers(prev)
    } else {
      return prev
    }
  }, reducer)
}

export function wrapEffect (plugins, effect) {
  return plugins.reduce((prev, plugin) => {
    if (typeof plugin === 'object' && plugin.wrapEffects) {
      return plugin.wrapEffects(prev)
    } else {
      return prev
    }
  }, effect)
}

export default function twine (opts?: Opts) {
  if (!opts) {
    opts = noop
  }
  let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts]

  return function output (model: Model) {
    let state = createState(model)
    let actions = createActions(model, [])

    function decorateActions (reducers: Model['reducers'], effects: Model['effects'], path: string[]) {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        const reducer = reducers[key]
        const decoratedReducer = function () {
          const nestedModel = retrieveNestedModel(model, path)
          const oldState = Object.assign({}, state)
          const localState = path.length ? getNestedObjFromPath(state, path) : state
          const reducerArgs = [localState].concat(Array.prototype.slice.call(arguments))
          const reducerResponse = reducer.apply(null, reducerArgs)
          const newState = Object.assign({}, localState, reducerResponse)
          const args = Array.prototype.slice.call(arguments)
          state = path.length ? updateStateAtPath(state, path, newState) : newState
          onReducerCalled(plugins, state, oldState, reducer.name, args)
          onStateChange(plugins, state, oldState, actions)
          return path.length && nestedModel.scoped ? reducerResponse : state
        }
        const wrappedReducer = wrapReducer(plugins, decoratedReducer)
        Object.defineProperty(wrappedReducer, 'name', {value: reducer.name})
        return { [key]: wrappedReducer }
      })
      const decoratedEffects = Object.keys(effects || {}).map(key => {
        const effect = effects[key]
        const decoratedEffect = function () {
          if (path.length) {
            const nestedModel = retrieveNestedModel(model, path)
            const effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state
            const effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions
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
        Object.defineProperty(wrappedEffect, 'name', {value: effect.name})
        return { [key]: wrappedEffect }
      })
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
    }

    function createActions (model: Model, path: string[]) {
      if (model.models) {
        const child = Object.keys(model.models).map(key => ({
          [key]: createActions(model.models[key], path.concat(key)),
        })).reduce(arrayToObj, {})
        return Object.assign({}, decorateActions(model.reducers, model.effects, path), child)
      }
      return decorateActions(model.reducers, model.effects, path)
    }

    return {
      state,
      actions,
    }
  }
}
