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

module.exports = function (model) {
  let state = createState(model)
  let methods = createMethods(model, state)
  let notify

  function decorateMethods (reducers, effects) {
    const decoratedReducers = Object.keys(reducers || {}).map(key => {
      return {
        [key]: function () {
          let newState = reducers[key](state, ...arguments)
          notify(newState)
          return newState
        }
      }
    })
    const decoratedEffects = Object.keys(effects || {}).map(key => {
      return {
        [key]: function () {
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
    methods,
    subscribe (fn) {
      notify = fn
    }
  }
}