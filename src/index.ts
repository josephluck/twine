import * as dotProp from 'dot-prop'
import Twine from './types'

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

export default function twine (opts?: Twine.Configuration): Twine.ReturnOutput {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model: Twine.Model): Twine.Output {
    let state = createState(model)
    let methods = createMethods(model, [])

    function decorateMethods (reducers: Twine.Reducers, effects: Twine.Effects, path: string[]): Twine.Methods {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            let newState
            if (path.length) {
              let localState = retrieveNestedModel(model, path).scoped ? dotProp.get(state, path.join('.')) : state
              let newLocalState = Object.assign({}, localState, reducers[key].apply(null, [localState].concat(Array.prototype.slice.call(arguments))))
              dotProp.set(state, path.join('.'), newLocalState)
              newState = state
            } else {
              newState = reducers[key].apply(null, [state].concat(Array.prototype.slice.call(arguments)))
            }
            onStateChange(newState, state, methods)
            onMethodCall.apply(null, [newState, state].concat(Array.prototype.slice.call(arguments)))
            state = newState
            return newState
          },
        }
      })
      const decoratedEffects = Object.keys(effects || {}).map(key => {
        return {
          [key]: function () {
            if (path.length) {
              let nestedModel = retrieveNestedModel(model, path)
              let effectState = nestedModel.scoped ? nestedModel.state : state
              let effectMethods = nestedModel.scoped ? dotProp.get(methods, path.join('.')) : methods
              return effects[key].apply(null, [effectState, effectMethods].concat(Array.prototype.slice.call(arguments)))
            }
            return effects[key].apply(null, [state, methods].concat(Array.prototype.slice.call(arguments)))
          },
        }
      })
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
    }

    function createMethods (model: Twine.Model, path: string[]): Twine.Methods {
      if (model.models) {
        const child = Object.keys(model.models).map(key => {
          return {
            [key]: createMethods(model.models[key], (path).concat(key)),
          }
        }).reduce(arrayToObj, {})
        return Object.assign({}, decorateMethods(model.reducers, model.effects, path), child)
      }
      return decorateMethods(model.reducers, model.effects, path)
    }

    return {
      state,
      methods,
    }
  }
}
