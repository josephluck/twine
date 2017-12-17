import Twine from './types'

export function noop(): null {
  return null
}

export function arrayToObj(curr: any, prev: any): any {
  return Object.assign({}, curr, prev)
}

export function mergeState(model: Twine.Model<any, any, any>): any {
  const models = model.models
  if (models) {
    let child = Object.keys(models)
      .map(key => ({
        [key]: mergeState(models[key]),
      }))
      .reduce(arrayToObj, {})

    const localState = Object.assign({}, model['state'], child)
    const computedState = model.computed ? model.computed(localState) : {}
    return Object.assign({}, localState, computedState)
  }
  const localState = model['state']
  const computedState = model.computed ? model.computed(localState) : {}
  return Object.assign({}, localState, computedState)
}

export function createState(model: Twine.Model<any, any, any>) {
  return mergeState(model)
}

export function retrieveNestedModel(
  model: Twine.Model<any, any, any>,
  path: string[],
  index: number = 0,
): Twine.Model<any, any, any> {
  if (model.models) {
    let currModel = model.models[path[index]]
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1)
    }
    return currModel
  }
  return model
}

export function getStateFromPath(state: Twine.State, path: string[]): Twine.State {
  if (path.length) {
    return getStateFromPath(state[path[0]], path.slice(1))
  }
  return state
}

export function updateStateAtPath(state: Twine.State, path: string[], value: any) {
  if (path.length > 0) {
    let key = path[0]
    if (path.length > 1) {
      state[key] = updateStateAtPath(state[key], path.slice(1), value)
    } else {
      state[key] = value
    }
  }
  return state
}

export function recursivelyUpdateComputedState(
  model: Twine.Model<any, any, any>,
  state: Twine.State,
  path: string[],
): Twine.State {
  const currentModel = retrieveNestedModel(model, path)
  const currentState = getStateFromPath(state, path)
  const computedState = currentModel
    ? currentModel.computed ? currentModel.computed(currentState) : {}
    : model.computed ? model.computed(currentState) : {}
  if (path.length > 0) {
    const newState = updateStateAtPath(state, path, {
      ...currentState,
      ...computedState,
    })
    const newPath = path.slice(0, path.length - 1)
    return recursivelyUpdateComputedState(model, newState, newPath)
  } else {
    const newState = {
      ...currentState,
      ...computedState,
    }
    return newState
  }
}
