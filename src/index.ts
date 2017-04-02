export type Subscriber = (state: State, prev: State, actions: any) => any
export type OnMethodCall = (state: State, prev: State, ...args: any[]) => any

export type Opts = Subscriber | {
  onStateChange: Subscriber,
  onMethodCall: OnMethodCall,
}

export interface Model {
  state?: any
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

export default function twine (opts?: Opts) {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model: Model) {
    let state = createState(model)
    let actions = createActions(model, [])

    function decorateActions (reducers: Model['reducers'], effects: Model['effects'], path: string[]) {
      const decoratedReducers = Object.keys(reducers || {}).map(key => ({
        [key]: function () {
          let nestedModel = retrieveNestedModel(model, path)
          let oldState = Object.assign({}, state)
          let localState = path.length ? getNestedObjFromPath(state, path) : state
          let reducerArgs = [localState].concat(Array.prototype.slice.call(arguments))
          let reducerResponse = reducers[key].apply(null, reducerArgs)
          let newState = Object.assign({}, localState, reducerResponse)
          state = path.length ? updateStateAtPath(state, path, newState) : newState
          let onMethodCallArgs = [state, oldState].concat(Array.prototype.slice.call(arguments))
          onMethodCall.apply(null, onMethodCallArgs)
          onStateChange(state, oldState, actions)
          if (path.length && nestedModel.scoped) {
            return reducerResponse
          } else {
            return state
          }
        },
      }))
      const decoratedEffects = Object.keys(effects || {}).map(key => ({
        [key]: function () {
          if (path.length) {
            let nestedModel = retrieveNestedModel(model, path)
            let effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state
            let effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions
            return effects[key].apply(null, [effectState, effectActions].concat(Array.prototype.slice.call(arguments)))
          }
          return effects[key].apply(null, [state, actions].concat(Array.prototype.slice.call(arguments)))
        },
      }))
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
