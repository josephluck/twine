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
  let notify

  function decorateReducers (reducers) {
    return Object.keys(reducers || {}).map(key => {
      return {
        [key]: function () {
          let newState = reducers[key](state, ...arguments)
          notify(newState)
          return newState
        }
      }
    }).reduce((curr, prev) => {
      return Object.assign({}, curr, prev)
    }, {})
  }

  function createMethods (model) {
    if (model.models) {
      let child = Object.keys(model.models).map(key => {
        return {
          [key]: createMethods(model.models[key])
        }
      }).reduce((curr, prev) => {
        return Object.assign({}, curr, prev)
      }, {})

      return Object.assign({}, decorateReducers(model.reducers), child)
    }
    return decorateReducers(model.reducers)
  }

  let state = createState(model)
  let methods = createMethods(model)



  return {
    state,
    methods,
    subscribe (fn) {
      notify = fn
    }
  }
}