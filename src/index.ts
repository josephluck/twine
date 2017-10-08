import * as Types from './types'
import * as pluginUtils from './plugins'
import * as utils from './utils'

export default function twine(model: Types.Model, opts?: Types.Opts) {
  if (!opts) {
    opts = utils.noop
  }
  let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts]
  let state = utils.createState(model)
  let actions = createActions(model, [])

  function decorateActions(
    reducers: Types.Model['reducers'],
    effects: Types.Model['effects'],
    path: string[],
  ) {
    const decoratedReducers = Object.keys(reducers || {}).map(key => {
      const reducer = reducers[key]
      const decoratedReducer = function() {
        // Call reducer & update the global state
        const currentModel = utils.retrieveNestedModel(model, path) || model
        const previousState = Object.assign({}, state)
        const currentModelsState = path.length ? utils.getStateFromPath(state, path) : previousState
        const reducerArgs = [currentModelsState].concat(Array.prototype.slice.call(arguments))
        const reducerResponse = reducer.apply(null, reducerArgs)
        const newState = Object.assign({}, currentModelsState, reducerResponse)
        state = path.length ? utils.updateStateAtPath(state, path, newState) : newState
        state = utils.recursivelyUpdateComputedState(model, state, path)

        // Plugins
        const pluginArgs = Array.prototype.slice.call(arguments)
        pluginUtils.onReducerCalled(plugins, state, previousState, reducer.name, pluginArgs)
        pluginUtils.onStateChange(plugins, state, previousState, actions)
        return path.length && currentModel.scoped
          ? Object.assign({}, currentModelsState, reducerResponse)
          : state
      }
      const wrappedReducer = pluginUtils.wrapReducer(plugins, decoratedReducer)
      Object.defineProperty(wrappedReducer, 'name', { value: reducer.name })
      return { [key]: wrappedReducer }
    })
    const decoratedEffects = Object.keys(effects || {}).map(key => {
      const effect = effects[key]
      const decoratedEffect = function() {
        if (path.length) {
          const nestedModel = utils.retrieveNestedModel(model, path)
          const effectState = nestedModel.scoped ? utils.getStateFromPath(state, path) : state
          const effectActions = nestedModel.scoped ? utils.getStateFromPath(actions, path) : actions
          const args = Array.prototype.slice.call(arguments)
          const effectArgs = [effectState, effectActions].concat(args)
          pluginUtils.onEffectCalled(plugins, state, effect.name, args)
          return effects[key].apply(null, effectArgs)
        }
        const args = Array.prototype.slice.call(arguments)
        const effectArgs = [state, actions].concat(args)
        pluginUtils.onEffectCalled(plugins, state, effect.name, args)
        return effects[key].apply(null, effectArgs)
      }
      const wrappedEffect = pluginUtils.wrapEffect(plugins, decoratedEffect)
      Object.defineProperty(wrappedEffect, 'name', { value: effect.name })
      return { [key]: wrappedEffect }
    })
    return decoratedReducers.concat(decoratedEffects).reduce(utils.arrayToObj, {})
  }

  function createActions(model: Types.Model, path: string[]) {
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
  }
}
