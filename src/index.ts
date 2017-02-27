import { Twine } from './types'

function noop () {
  return null
}

function arrayToObj (curr, prev) {
  return Object.assign({}, curr, prev)
}

function merge (model: Twine.Model, prop: string) {
  if (model.models) {
    let child = Object.keys(model.models).map(key => {
      return {
        [key]: merge(model.models[key], prop),
      }
    }).reduce(arrayToObj, {})

    return Object.assign({}, model[prop], child)
  }
  return model[prop]
}

function createState (model: Twine.Model): Twine.State {
  return merge(model, 'state')
}

function retrieveNestedModel (model: Twine.Model, path: string[], index: number = 0): Twine.Model {
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
    arr = path
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

export default function twine (opts?: Twine.Configuration): Twine.ReturnOutput {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model: Twine.Model): Twine.Output {
    let state = createState(model)
    let actions = createActions(model, [])

    function decorateActions (reducers: Twine.Reducers, effects: Twine.Effects, path: string[]): Twine.Actions {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            let oldState = Object.assign({}, state)
            let localState = path.length ? getNestedObjFromPath(state, path) : state
            let reducerArgs = [localState].concat(Array.prototype.slice.call(arguments))
            let reducerResponse = reducers[key].apply(null, reducerArgs)
            let newLocalState = Object.assign({}, localState, reducerResponse)
            if (path.length) {
              state = path.length ? updateStateAtPath(state, path, newLocalState) : newLocalState
            } else {
              state = newLocalState
            }
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

    function createActions (model: Twine.Model, path: string[]): Twine.Actions {
      if (model.models) {
        const child = Object.keys(model.models).map(key => {
          return {
            [key]: createActions(model.models[key], (path).concat(key)),
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
