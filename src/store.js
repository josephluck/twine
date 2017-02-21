module.exports = function (model) {
  function createState (model) {
    return model.state
  }

  function createMethods () {
    return Object.keys(model.reducers).map(key => {
      return {
        [key]: function () {
          let newState = model.reducers[key](state, ...arguments)
          notify(newState)
          return newState
        }
      }
    }).reduce((curr, prev) => {
      return Object.assign({}, curr, prev)
    }, {})
  }

  let notify
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