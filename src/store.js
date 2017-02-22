function noop () {
  return null
}

function merge (model, prop) {
  if (model.models) {
    let child = Object.keys(model.models).map(key => {
      return {
        [key]: merge(model.models[key], prop)
      }
    }).reduce((curr, prev) => {
      return Object.assign({}, curr, prev)
    }, {})

    return Object.assign({}, model[prop], child)
  }
  return model[prop]
}

function createState (model) {
  return merge(model, 'state')
}

module.exports = function (opts = noop) {
  let notify = typeof opts === 'function' ? opts : opts.subscription || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop
  let onStateChange = typeof opts === 'function' ? noop : opts.onStateChange || noop

  return function (model) {
    let state = createState(model)
    let methods = createMethods(model, state)

    function decorateMethods (reducers, effects) {
      const decoratedReducers = Object.keys(reducers || {}).map(key => {
        return {
          [key]: function () {
            newState = reducers[key](state, ...arguments)
            notify(newState)
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
            onMethodCall(state, ...arguments)
            return effects[key](state, methods, ...arguments)
          }
        }
      })
      return decoratedReducers.concat(decoratedEffects).reduce((curr, prev) => {
        return Object.assign({}, curr, prev)
      }, {})
    }

    function createMethods (model) {
      if (model.models) {
        const child = Object.keys(model.models).map(key => {
          return {
            [key]: createMethods(model.models[key])
          }
        }).reduce((curr, prev) => {
          return Object.assign({}, curr, prev)
        }, {})
        return Object.assign({}, decorateMethods(model.reducers, model.effects), child)
      }
      return decorateMethods(model.reducers, model.effects)
    }

    return {
      state,
      methods
    }
  }
}
