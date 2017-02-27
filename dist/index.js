"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function getNestedObjFromPath(state, path) {
    if (path.length) {
        return getNestedObjFromPath(state[path[0]], path.slice(1));
    }
    return state;
}
exports.getNestedObjFromPath = getNestedObjFromPath;
function updateStateAtPath(obj, path, value) {
    var arr;
    var key;
    if (Array.isArray(path) && path.length > 0) {
        arr = path;
        key = arr[0];
        if (arr.length > 1) {
            arr.shift();
            obj[key] = updateStateAtPath(obj[key], arr, value);
        }
        else {
            obj[key] = value;
        }
    }
    return obj;
}
exports.updateStateAtPath = updateStateAtPath;
function twine(opts) {
    if (!opts) {
        opts = noop;
    }
    var onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop;
    var onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop;
    return function output(model) {
        var state = createState(model);
        var actions = createActions(model, []);
        function decorateActions(reducers, effects, path) {
            var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
                return _a = {},
                    _a[key] = function () {
                        var oldState = Object.assign({}, state);
                        var localState = path.length ? getNestedObjFromPath(state, path) : state;
                        var reducerArgs = [localState].concat(Array.prototype.slice.call(arguments));
                        var reducerResponse = reducers[key].apply(null, reducerArgs);
                        var newLocalState = Object.assign({}, localState, reducerResponse);
                        if (path.length) {
                            state = path.length ? updateStateAtPath(state, path, newLocalState) : newLocalState;
                        }
                        else {
                            state = newLocalState;
                        }
                        var onMethodCallArgs = [state, oldState].concat(Array.prototype.slice.call(arguments));
                        onMethodCall.apply(null, onMethodCallArgs);
                        onStateChange(state, oldState, actions);
                        return newLocalState;
                    },
                    _a;
                var _a;
            });
            var decoratedEffects = Object.keys(effects || {}).map(function (key) {
                return _a = {},
                    _a[key] = function () {
                        if (path.length) {
                            var nestedModel = retrieveNestedModel(model, path);
                            var effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state;
                            var effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions;
                            return effects[key].apply(null, [effectState, effectActions].concat(Array.prototype.slice.call(arguments)));
                        }
                        return effects[key].apply(null, [state, actions].concat(Array.prototype.slice.call(arguments)));
                    },
                    _a;
                var _a;
            });
            return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {});
        }
        function createActions(model, path) {
            if (model.models) {
                var child = Object.keys(model.models).map(function (key) {
                    return _a = {},
                        _a[key] = createActions(model.models[key], (path).concat(key)),
                        _a;
                    var _a;
                }).reduce(arrayToObj, {});
                return Object.assign({}, decorateActions(model.reducers, model.effects, path), child);
            }
            return decorateActions(model.reducers, model.effects, path);
        }
        return {
            state: state,
            actions: actions,
        };
    };
}
exports.default = twine;
