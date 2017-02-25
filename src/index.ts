import * as dotProp from 'dot-prop'
import { Tansu } from './types'

function noop () {
  return null
}

function arrayToObj (curr, prev) {
  return Object.assign({}, curr, prev)
}

function merge (model: Tansu.Model, prop: string) {
  if (model.models) {
    let child = Object.keys(model.models).map(key => {
      return {
        [key]: merge(model.models[key], prop)
      }
    }).reduce(arrayToObj, {})

    return Object.assign({}, model[prop], child)
  }
  return model[prop]
}

function createState (model: Tansu.Model): Tansu.State {
  return merge(model, 'state')
}

function retrieveNestedModel (model: Tansu.Model, path: string[], index: number = 0): Tansu.Model {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export default function tansu (opts?: Tansu.Configuration): Tansu.ReturnOutput {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model: Tansu.Model): Tansu.Output {
    let state = createState(model)
    let methods = createMethods(model, [])

    function decorateMethods (reducers: Tansu.Reducers, effects: Tansu.Effects, path: string[]): Tansu.Methods {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            let newState
            if (path.length) {
              let nestedModel = retrieveNestedModel(model, path)
              let localState = nestedModel.scoped ? nestedModel.state : state
              let newLocalState = reducers[key].apply(null, [localState].concat(Array.prototype.slice.call(arguments)))
              dotProp.set(state, path.join('.'), newLocalState)
              newState = state
            } else {
              newState = reducers[key].apply(null, [state].concat(Array.prototype.slice.call(arguments)))
            }
            onStateChange(newState, state, methods)
            onMethodCall.apply(null, [newState, state].concat(Array.prototype.slice.call(arguments)))
            state = newState
            return newState
          }
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
          }
        }
      })
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
    }

    function createMethods (model: Tansu.Model, path: string[]): Tansu.Methods {
      if (model.models) {
        const child = Object.keys(model.models).map(key => {
          return {
            [key]: createMethods(model.models[key], (path).concat(key))
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
