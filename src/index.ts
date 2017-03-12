function noop () {
  return null
}

function arrayToObj (curr, prev) {
  return Object.assign({}, curr, prev)
}

export function merge (model, prop) {
  if (model.models) {
    let child = Object.keys(model.models).map(key => ({
      [key]: merge(model.models[key], prop),
    })).reduce(arrayToObj, {})

    return Object.assign({}, model[prop], child)
  }
  return model[prop]
}

export function createState (model) {
  return merge(model, 'state')
}

export function retrieveNestedModel (model, path, index = 0) {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export function getNestedObjFromPath (state, path) {
  if (path.length) {
    return getNestedObjFromPath(state[path[0]], path.slice(1))
  }
  return state
}

export function updateStateAtPath (obj, path, value) {
  if (path.length > 0) {
    let key = path[0]
    if (path.length > 1) {
      obj[key] = updateStateAtPath(obj[key], path.slice(1), value)
    } else {
      obj[key] = value
    }
  }
  return obj
}

export default function twine (opts) {
  if (!opts) {
    opts = noop
  }
  let onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop
  let onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop

  return function output (model) {
    let state = createState(model)
    let actions = createActions(model, [])

    function decorateActions (reducers, effects, path) {
      const decoratedReducers = Object.keys(reducers || {}).map(key => ({
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

    function createActions (model, path) {
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
