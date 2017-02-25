"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotProp = require("dot-prop");
function noop() {
    return null;
}
function arrayToObj(curr, prev) {
    return Object.assign({}, curr, prev);
}
function merge(model, prop) {
    if (model.models) {
        var child = Object.keys(model.models).map(function (key) {
            return _a = {},
                _a[key] = merge(model.models[key], prop),
                _a;
            var _a;
        }).reduce(arrayToObj, {});
        return Object.assign({}, model[prop], child);
    }
    return model[prop];
}
function createState(model) {
    return merge(model, 'state');
}
function retrieveNestedModel(model, path, index) {
    if (index === void 0) { index = 0; }
    if (model.models) {
        var currModel = model.models[path[index]];
        if (currModel && currModel.models && currModel.models[path[index + 1]]) {
            return retrieveNestedModel(currModel, path, index + 1);
        }
        return currModel;
    }
    return model;
}
function tansu(opts) {
    if (!opts) {
        opts = noop;
    }
    var onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop;
    var onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop;
    return function output(model) {
        var state = createState(model);
        var methods = createMethods(model, []);
        function decorateMethods(reducers, effects, path) {
            var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
                return _a = {},
                    _a[key] = function () {
                        var newState;
                        if (path.length) {
                            var localState = retrieveNestedModel(model, path).scoped ? dotProp.get(state, path.join('.')) : state;
                            var newLocalState = Object.assign({}, localState, reducers[key].apply(null, [localState].concat(Array.prototype.slice.call(arguments))));
                            dotProp.set(state, path.join('.'), newLocalState);
                            newState = state;
                        }
                        else {
                            newState = reducers[key].apply(null, [state].concat(Array.prototype.slice.call(arguments)));
                        }
                        onStateChange(newState, state, methods);
                        onMethodCall.apply(null, [newState, state].concat(Array.prototype.slice.call(arguments)));
                        state = newState;
                        return newState;
                    },
                    _a;
                var _a;
            });
            var decoratedEffects = Object.keys(effects || {}).map(function (key) {
                return _a = {},
                    _a[key] = function () {
                        if (path.length) {
                            var nestedModel = retrieveNestedModel(model, path);
                            var effectState = nestedModel.scoped ? nestedModel.state : state;
                            var effectMethods = nestedModel.scoped ? dotProp.get(methods, path.join('.')) : methods;
                            return effects[key].apply(null, [effectState, effectMethods].concat(Array.prototype.slice.call(arguments)));
                        }
                        return effects[key].apply(null, [state, methods].concat(Array.prototype.slice.call(arguments)));
                    },
                    _a;
                var _a;
            });
            return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {});
        }
        function createMethods(model, path) {
            if (model.models) {
                var child = Object.keys(model.models).map(function (key) {
                    return _a = {},
                        _a[key] = createMethods(model.models[key], (path).concat(key)),
                        _a;
                    var _a;
                }).reduce(arrayToObj, {});
                return Object.assign({}, decorateMethods(model.reducers, model.effects, path), child);
            }
            return decorateMethods(model.reducers, model.effects, path);
        }
        return {
            state: state,
            methods: methods,
        };
    };
}
exports.default = tansu;