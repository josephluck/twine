(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.__esModule = true;
function noop() {
    return null;
}
function arrayToObj(curr, prev) {
    return Object.assign({}, curr, prev);
}
function merge(model, prop) {
    if (model.models) {
        var child = Object.keys(model.models).map(function (key) {
            return _a = {}, _a[key] = merge(model.models[key], prop), _a;
            var _a;
        }).reduce(arrayToObj, {});
        return Object.assign({}, model[prop], child);
    }
    return model[prop];
}
exports.merge = merge;
function createState(model) {
    return merge(model, 'state');
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
function getNestedObjFromPath(state, path) {
    if (path.length) {
        return getNestedObjFromPath(state[path[0]], path.slice(1));
    }
    return state;
}
exports.getNestedObjFromPath = getNestedObjFromPath;
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
                return _a = {}, _a[key] = function () {
                    var reducer = reducers[key];
                    var nestedModel = retrieveNestedModel(model, path);
                    var oldState = Object.assign({}, state);
                    var localState = path.length ? getNestedObjFromPath(state, path) : state;
                    var reducerArgs = [localState].concat(Array.prototype.slice.call(arguments));
                    var reducerResponse = reducer.apply(null, reducerArgs);
                    var newState = Object.assign({}, localState, reducerResponse);
                    var args = Array.prototype.slice.call(arguments);
                    state = path.length ? updateStateAtPath(state, path, newState) : newState;
                    onReducerCalled(plugins, state, oldState, reducer.name, args);
                    onStateChange(plugins, state, oldState, actions);
                    return path.length && nestedModel.scoped ? reducerResponse : state;
                }, _a;
                var _a;
            });
            var decoratedEffects = Object.keys(effects || {}).map(function (key) {
                return _a = {}, _a[key] = function () {
                    var effect = effects[key];
                    if (path.length) {
                        var nestedModel = retrieveNestedModel(model, path);
                        var effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state;
                        var effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions;
                        var args_1 = Array.prototype.slice.call(arguments);
                        var effectArgs_1 = [effectState, effectActions].concat(args_1);
                        onEffectCalled(plugins, state, effect.name, args_1);
                        return effects[key].apply(null, effectArgs_1);
                    }
                    var args = Array.prototype.slice.call(arguments);
                    var effectArgs = [state, actions].concat(args);
                    onEffectCalled(plugins, state, effect.name, args);
                    return effects[key].apply(null, effectArgs);
                }, _a;
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
