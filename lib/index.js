"use strict";
exports.__esModule = true;
var pluginUtils = require("./plugins");
var utils = require("./utils");
function twine(model, opts) {
    if (!opts) {
        opts = utils.noop;
    }
    var plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts];
    var state = utils.createState(model);
    var actions = createActions(model, []);
    function decorateActions(reducers, effects, path) {
        var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
            var reducer = reducers[key];
            var decoratedReducer = function (params) {
                if (params === void 0) { params = {}; }
                var previousState = Object.assign({}, state);
                var currentModelsState = path.length ? utils.getStateFromPath(state, path) : previousState;
                var reducerResponse = reducer(currentModelsState, params);
                var newState = Object.assign({}, currentModelsState, reducerResponse);
                state = path.length ? utils.updateStateAtPath(state, path, newState) : newState;
                state = utils.recursivelyUpdateComputedState(model, state, path);
                pluginUtils.onReducerCalled(plugins, state, previousState, reducer.name, params);
                pluginUtils.onStateChange(plugins, state, previousState, actions);
                return newState;
            };
            var wrappedReducer = pluginUtils.wrapReducer(plugins, decoratedReducer);
            Object.defineProperty(wrappedReducer, 'name', { value: reducer.name });
            return _a = {}, _a[key] = wrappedReducer, _a;
            var _a;
        });
        var decoratedEffects = Object.keys(effects || {}).map(function (key) {
            var effect = effects[key];
            var decoratedEffect = function (params) {
                if (params === void 0) { params = {}; }
                if (path.length) {
                    var nestedModel = utils.retrieveNestedModel(model, path);
                    var effectState = nestedModel.scoped ? utils.getStateFromPath(state, path) : state;
                    var effectActions = nestedModel.scoped ? utils.getStateFromPath(actions, path) : actions;
                    pluginUtils.onEffectCalled(plugins, state, effect.name, params);
                    return effect(effectState, effectActions, params);
                }
                else {
                    pluginUtils.onEffectCalled(plugins, state, effect.name, params);
                    return effect(state, actions, params);
                }
            };
            var wrappedEffect = pluginUtils.wrapEffect(plugins, decoratedEffect);
            Object.defineProperty(wrappedEffect, 'name', { value: effect.name });
            return _a = {}, _a[key] = wrappedEffect, _a;
            var _a;
        });
        return decoratedReducers.concat(decoratedEffects).reduce(utils.arrayToObj, []);
    }
    function createActions(model, path) {
        if (model.models) {
            var child = Object.keys(model.models)
                .map(function (key) {
                return (_a = {},
                    _a[key] = createActions(model.models[key], path.concat(key)),
                    _a);
                var _a;
            })
                .reduce(utils.arrayToObj, {});
            return Object.assign({}, decorateActions(model.reducers, model.effects, path), child);
        }
        return decorateActions(model.reducers, model.effects, path);
    }
    return {
        state: state,
        actions: actions
    };
}
exports["default"] = twine;
