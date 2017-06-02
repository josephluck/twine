(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var __assign = undefined && undefined.__assign || Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) {
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
    }
    return t;
};
exports.__esModule = true;
function noop() {
    return null;
}
function arrayToObj(curr, prev) {
    return Object.assign({}, curr, prev);
}
function mergeState(model) {
    if (model.models) {
        var child = Object.keys(model.models).map(function (key) {
            return _a = {}, _a[key] = mergeState(model.models[key]), _a;
            var _a;
        }).reduce(arrayToObj, {});
        var localState_1 = Object.assign({}, model['state'], child);
        var computedState_1 = model.computed ? model.computed(localState_1) : {};
        return Object.assign({}, localState_1, computedState_1);
    }
    var localState = model['state'];
    var computedState = model.computed ? model.computed(localState) : {};
    return Object.assign({}, localState, computedState);
}
exports.mergeState = mergeState;
function createState(model) {
    return mergeState(model);
}
exports.createState = createState;
function retrieveNestedModel(model, path, index) {
    if (index === void 0) {
        index = 0;
    }
    if (model.models) {
        var currModel = model.models[path[index]];
        if (currModel && currModel.models && currModel.models[path[index + 1]]) {
            return retrieveNestedModel(currModel, path, index + 1);
        }
        return currModel;
    }
    return model;
}
exports.retrieveNestedModel = retrieveNestedModel;
function getStateFromPath(state, path) {
    if (path.length) {
        return getStateFromPath(state[path[0]], path.slice(1));
    }
    return state;
}
exports.getStateFromPath = getStateFromPath;
function updateStateAtPath(state, path, value) {
    if (path.length > 0) {
        var key = path[0];
        if (path.length > 1) {
            state[key] = updateStateAtPath(state[key], path.slice(1), value);
        } else {
            state[key] = value;
        }
    }
    return state;
}
exports.updateStateAtPath = updateStateAtPath;
function recursivelyUpdateComputedState(model, state, path) {
    var currentModel = retrieveNestedModel(model, path);
    var currentState = getStateFromPath(state, path);
    var computedState = currentModel ? currentModel.computed ? currentModel.computed(currentState) : {} : model.computed ? model.computed(currentState) : {};
    if (path.length > 0) {
        var newState = updateStateAtPath(state, path, __assign({}, currentState, computedState));
        var newPath = path.slice(0, path.length - 1);
        return recursivelyUpdateComputedState(model, newState, newPath);
    } else {
        var newState = __assign({}, currentState, computedState);
        return newState;
    }
}
exports.recursivelyUpdateComputedState = recursivelyUpdateComputedState;
function onStateChange(plugins, state, prev, actions) {
    return plugins.map(function (plugin) {
        if (typeof plugin === 'function') {
            plugin(state, prev, actions);
        } else if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.onStateChange) {
            plugin.onStateChange(state, prev, actions);
        }
    });
}
exports.onStateChange = onStateChange;
function onReducerCalled(plugins, state, prev, name, args) {
    return plugins.map(function (plugin) {
        if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.onReducerCalled) {
            plugin.onReducerCalled.apply(null, [state, prev, name].concat(args));
        }
    });
}
exports.onReducerCalled = onReducerCalled;
function onEffectCalled(plugins, prev, name, args) {
    return plugins.map(function (plugin) {
        if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.onEffectCalled) {
            plugin.onEffectCalled.apply(null, [prev, name].concat(args));
        }
    });
}
exports.onEffectCalled = onEffectCalled;
function wrapReducer(plugins, reducer) {
    return plugins.reduce(function (prev, plugin) {
        if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.wrapReducers) {
            return plugin.wrapReducers(prev);
        } else {
            return prev;
        }
    }, reducer);
}
exports.wrapReducer = wrapReducer;
function wrapEffect(plugins, effect) {
    return plugins.reduce(function (prev, plugin) {
        if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.wrapEffects) {
            return plugin.wrapEffects(prev);
        } else {
            return prev;
        }
    }, effect);
}
exports.wrapEffect = wrapEffect;
function twine(opts) {
    if (!opts) {
        opts = noop;
    }
    var plugins = (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object' && Array.isArray(opts) ? opts : [opts];
    return function output(model) {
        var state = createState(model);
        var actions = createActions(model, []);
        function decorateActions(reducers, effects, path) {
            var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
                var reducer = reducers[key];
                var decoratedReducer = function decoratedReducer() {
                    // Call reducer & update the global state
                    var currentModel = retrieveNestedModel(model, path) || model;
                    var previousState = Object.assign({}, state);
                    var currentModelsState = path.length ? getStateFromPath(state, path) : previousState;
                    var reducerArgs = [currentModelsState].concat(Array.prototype.slice.call(arguments));
                    var reducerResponse = reducer.apply(null, reducerArgs);
                    var newState = Object.assign({}, currentModelsState, reducerResponse);
                    state = path.length ? updateStateAtPath(state, path, newState) : newState;
                    state = recursivelyUpdateComputedState(model, state, path);
                    // Plugins
                    var pluginArgs = Array.prototype.slice.call(arguments);
                    onReducerCalled(plugins, state, previousState, reducer.name, pluginArgs);
                    onStateChange(plugins, state, previousState, actions);
                    return path.length && currentModel.scoped ? reducerResponse : state;
                };
                var wrappedReducer = wrapReducer(plugins, decoratedReducer);
                Object.defineProperty(wrappedReducer, 'name', { value: reducer.name });
                return _a = {}, _a[key] = wrappedReducer, _a;
                var _a;
            });
            var decoratedEffects = Object.keys(effects || {}).map(function (key) {
                var effect = effects[key];
                var decoratedEffect = function decoratedEffect() {
                    if (path.length) {
                        var nestedModel = retrieveNestedModel(model, path);
                        var effectState = nestedModel.scoped ? getStateFromPath(state, path) : state;
                        var effectActions = nestedModel.scoped ? getStateFromPath(actions, path) : actions;
                        var args_1 = Array.prototype.slice.call(arguments);
                        var effectArgs_1 = [effectState, effectActions].concat(args_1);
                        onEffectCalled(plugins, state, effect.name, args_1);
                        return effects[key].apply(null, effectArgs_1);
                    }
                    var args = Array.prototype.slice.call(arguments);
                    var effectArgs = [state, actions].concat(args);
                    onEffectCalled(plugins, state, effect.name, args);
                    return effects[key].apply(null, effectArgs);
                };
                var wrappedEffect = wrapEffect(plugins, decoratedEffect);
                Object.defineProperty(wrappedEffect, 'name', { value: effect.name });
                return _a = {}, _a[key] = wrappedEffect, _a;
                var _a;
            });
            return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {});
        }
        function createActions(model, path) {
            if (model.models) {
                var child = Object.keys(model.models).map(function (key) {
                    return _a = {}, _a[key] = createActions(model.models[key], path.concat(key)), _a;
                    var _a;
                }).reduce(arrayToObj, {});
                return Object.assign({}, decorateActions(model.reducers, model.effects, path), child);
            }
            return decorateActions(model.reducers, model.effects, path);
        }
        return {
            state: state,
            actions: actions
        };
    };
}
exports["default"] = twine;

},{}]},{},[1]);
