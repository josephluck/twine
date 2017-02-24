const dotProp = require('dot-prop');

function noop () {
  return null
}

function arrayToObj (curr, prev) {
  return Object.assign({}, curr, prev)
}

function merge (model, prop) {
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

function createState (model) {
  return merge(model, 'state')
}

function retrieveNestedModel (model, path, index = 0) {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

module.exports = function (opts = noop) {
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function (model) {
    let state = createState(model)
    let methods = createMethods(model, [])

    function decorateMethods (reducers, effects, path) {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            let newState
            if (path.length) {
              let localState = retrieveNestedModel(model, path).scoped ? dotProp.get(state, path.join('.')) : state
              let newLocalState = Object.assign({}, localState, reducers[key](localState, ...arguments))
              dotProp.set(state, path.join('.'), newLocalState)
              newState = state
            } else {
              newState = reducers[key](state, ...arguments)
            }
            onStateChange(newState, state)
            onMethodCall(newState, state, ...arguments)
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
              return effects[key](effectState, effectMethods, ...arguments)
            }
            return effects[key](state, methods, ...arguments)
          }
        }
      })
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {})
    }

    function createMethods (model, path) {
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
      methods
    }
  }
}
