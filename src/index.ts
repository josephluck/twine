import Twine from './types'
import * as pluginUtils from './plugins'
import * as utils from './utils'

export { default as Twine } from './types'

export default function twine<S, A>(model: Twine.Model<any, any, any>, opts?: Twine.Opts<S, A>) {
  if (!opts) {
    opts = utils.noop
  }
  let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts]
  let state = utils.createState(model)
  let actions = createActions(model, [])
  let subscribers: Twine.Subscriber<S, A>[] = []

  function decorateActions(
    reducers: Twine.Model<any, any, any>['reducers'],
    effects: Twine.Model<any, any, any>['effects'],
    path: string[],
  ) {
    const decoratedReducers = Object.keys(reducers || {}).map(key => {
      const reducer = reducers[key]
      const decoratedReducer: Twine.ReducerApi<any, any> = function (params) {
        const previousState = Object.assign({}, state)
        const currentModelsState = path.length ? utils.getStateFromPath(state, path) : previousState
        const reducerResponse = reducer(currentModelsState, params)
        const newState = Object.assign({}, currentModelsState, reducerResponse)
        state = path.length ? utils.updateStateAtPath(state, path, newState) : newState
        state = utils.recursivelyUpdateComputedState(model, state, path)
        pluginUtils.onReducerCalled<S, A>(plugins, state, previousState, reducer.name, params)
        pluginUtils.onStateChange<S, A>(plugins, state, previousState, actions)
        notifySubscribers(state, previousState, actions)
        return newState
      }
      const wrappedReducer = pluginUtils.wrapReducer<S, A>(plugins, decoratedReducer)
      Object.defineProperty(wrappedReducer, 'name', { value: reducer.name })
      return { [key]: wrappedReducer }
    })
    const decoratedEffects = Object.keys(effects || {}).map(key => {
      const effect = effects[key]
      const decoratedEffect: Twine.EffectApi<any> = function (params) {
        if (path.length) {
          const nestedModel = utils.retrieveNestedModel(model, path)
          const effectState = nestedModel.scoped ? utils.getStateFromPath(state, path) : state
          const effectActions = nestedModel.scoped ? utils.getStateFromPath(actions, path) : actions
          pluginUtils.onEffectCalled<S, A>(plugins, state, effect.name, params)
          return effect(effectState, effectActions, params)
        } else {
          pluginUtils.onEffectCalled<S, A>(plugins, state, effect.name, params)
          return effect(state, actions, params)
        }
      }
      const wrappedEffect = pluginUtils.wrapEffect<S, A>(plugins, decoratedEffect)
      Object.defineProperty(wrappedEffect, 'name', { value: effect.name })
      return { [key]: wrappedEffect }
    })
    return decoratedReducers.concat(decoratedEffects).reduce(utils.arrayToObj, [])
  }

  function createActions(
    model: Twine.Model<any, any, any>,
    path: string[],
  ): Twine.Actions<any, any> {
    if (model.models) {
      const child = Object.keys(model.models)
        .map(key => ({
          [key]: createActions(model.models![key], path.concat(key)),
        }))
        .reduce(utils.arrayToObj, {})
      return Object.assign({}, decorateActions(model.reducers, model.effects, path), child)
    }
    return decorateActions(model.reducers, model.effects, path)
  }

  function notifySubscribers(
    state: Twine.State,
    previousState: Twine.State,
    actions: Twine.Actions<any, any>,
  ) {
    subscribers.forEach(subscriber => subscriber(state, previousState, actions as any))
  }

  function subscribe(fn: Twine.Subscriber<S, A>): () => void {
    subscribers = [...subscribers, fn]
    return function unsubscribe() {
      subscribers = subscribers.filter((_, i) => i !== subscribers.indexOf(fn))
    }
  }

  function getState(): S {
    return state
  }

  function replaceState(newState: S) {
    state = newState
  }

  return {
    state,
    actions,
    subscribe,
    getState,
    replaceState,
  } as Twine.Return<S, A>
}
