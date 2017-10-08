import * as Types from './types'
import * as pluginUtils from './plugins'
import * as utils from './utils'

export default function twine<S, A>(model: Types.ModelImpl<any, any, any>, opts?: Types.Opts) {
  if (!opts) {
    opts = utils.noop
  }
  let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts]
  let state = utils.createState(model)
  let actions = createActions(model, [])

  function decorateActions(
    reducers: Types.ModelImpl<any, any, any>['reducers'],
    effects: Types.ModelImpl<any, any, any>['effects'],
    path: string[],
  ) {
    const decoratedReducers = Object.keys(reducers || {}).map(key => {
      const reducer = reducers[key]
      const decoratedReducer = function(params = {}) {
        const previousState = Object.assign({}, state)
        const currentModelsState = path.length ? utils.getStateFromPath(state, path) : previousState
        const reducerResponse = reducer(Object.assign({ state: currentModelsState }, params, {}))
        const newState = Object.assign({}, currentModelsState, reducerResponse)
        state = path.length ? utils.updateStateAtPath(state, path, newState) : newState
        state = utils.recursivelyUpdateComputedState(model, state, path)
        pluginUtils.onReducerCalled(plugins, state, previousState, reducer.name, params)
        pluginUtils.onStateChange(plugins, state, previousState, actions)
        return Object.assign({}, currentModelsState, reducerResponse)
      }
      const wrappedReducer = pluginUtils.wrapReducer(plugins, decoratedReducer)
      Object.defineProperty(wrappedReducer, 'name', { value: reducer.name })
      return { [key]: wrappedReducer }
    })
    const decoratedEffects = Object.keys(effects || {}).map(key => {
      const effect = effects[key]
      const decoratedEffect = function(params = {}) {
        if (path.length) {
          const nestedModel = utils.retrieveNestedModel(model, path)
          const effectState = nestedModel.scoped ? utils.getStateFromPath(state, path) : state
          const effectActions = nestedModel.scoped ? utils.getStateFromPath(actions, path) : actions
          const args = Array.prototype.slice.call(arguments)
          pluginUtils.onEffectCalled(plugins, state, effect.name, args)
          return effect(Object.assign({ state: effectState, actions: effectActions }, params, {}))
        } else {
          pluginUtils.onEffectCalled(plugins, state, effect.name, params)
          return effect(Object.assign({ state, actions }, params, {}))
        }
      }
      const wrappedEffect = pluginUtils.wrapEffect(plugins, decoratedEffect)
      Object.defineProperty(wrappedEffect, 'name', { value: effect.name })
      return { [key]: wrappedEffect }
    })
    return decoratedReducers.concat(decoratedEffects).reduce(utils.arrayToObj, {})
  }

  function createActions(model: Types.ModelImpl<any, any, any>, path: string[]) {
    if (model.models) {
      const child = Object.keys(model.models)
        .map(key => ({
          [key]: createActions(model.models[key], path.concat(key)),
        }))
        .reduce(utils.arrayToObj, {})
      return Object.assign({}, decorateActions(model.reducers, model.effects, path), child)
    }
    return decorateActions(model.reducers, model.effects, path)
  }

  return {
    state,
    actions,
  } as Types.Return<S, A>
}
