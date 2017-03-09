export type Reducer = (state, ...args: any[]) => any
export interface Reducers {
  [key: string]: Reducer
}
export type Effect = (state, actions, ...args: any[]) => any
export interface Effects {
  [key: string]: Effect
}
export interface Model {
  scoped?: boolean
  state: any
  reducers?: Reducers
  effects?: Effects
  models?: Models
}
export interface Models {
  [key: string]: Model
}
export type Subscription = (state, prev, actions: Actions) => any
export interface ConfigurationOpts {
  onStateChange: Subscription
  onMethodCall: any
}
export type Configuration = Subscription | ConfigurationOpts
export interface Actions {
  [key: string]: Reducer | Effect | Actions
}
export type State = any
export interface Output {
  state: any
  actions: any
}
export type ReturnOutput = (model: Model) => Output

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

export function createState (model: Model): State {
  return merge(model, 'state')
}

export function retrieveNestedModel (model: Model, path: string[], index: number = 0): Model {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export function getNestedObjFromPath (state, path: any[]) {
  if (path.length) {
    return getNestedObjFromPath(state[path[0]], path.slice(1))
  }
  return state
}

export function updateStateAtPath (obj, path, value) {
  let arr
  let key
  if (Array.isArray(path) && path.length > 0) {
    arr = path.slice()
    key = arr[0]
    if (arr.length > 1) {
      arr.shift()
      obj[key] = updateStateAtPath(obj[key], arr, value)
    } else {
      obj[key] = value
    }
  }
  return obj
}

export default function twine (opts?: Configuration): ReturnOutput {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model: Model): Output {
    let state = createState(model)
    let actions = createActions(model, [])

    function decorateActions (reducers: Reducers, effects: Effects, path: string[]): Actions {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            let oldState = Object.assign({}, state)
            let localState = path.length ? getNestedObjFromPath(state, path) : state
            let reducerArgs = [localState].concat(Array.prototype.slice.call(arguments))
            let reducerResponse = reducers[key].apply(null, reducerArgs)
            let newLocalState = Object.assign({}, localState, reducerResponse)
            state = path.length ? updateStateAtPath(state, path, newLocalState) : newLocalState
            let onMethodCallArgs = [state, oldState].concat(Array.prototype.slice.call(arguments))
            onMethodCall.apply(null, onMethodCallArgs)
            onStateChange(state, oldState, actions)
            return newLocalState
          },
        }
      })
      const decoratedEffects = Object.keys(effects || {}).map(key => {
        return {
          [key]: function () {
            if (path.length) {
              let nestedModel = retrieveNestedModel(model, path)
              let effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state
              let effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions
              return effects[key].apply(null, [effectState, effectActions].concat(Array.prototype.slice.call(arguments)))
            }
            return effects[key].apply(null, [state, actions].concat(Array.prototype.slice.call(arguments)))
          },
        }
      })
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
    }

    function createActions (model: Model, path: string[]): Actions {
      if (model.models) {
        const child = Object.keys(model.models).map(key => {
          return {
            [key]: createActions(model.models[key], path.concat(key)),
          }
        }).reduce(arrayToObj, {})
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
