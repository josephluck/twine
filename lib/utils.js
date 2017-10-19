"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
function noop() {
    return null;
}
exports.noop = noop;
function arrayToObj(curr, prev) {
    return Object.assign({}, curr, prev);
}
exports.arrayToObj = arrayToObj;
function mergeState(model) {
    var models = model.models;
    if (models) {
        var child = Object.keys(models)
            .map(function (key) {
            return (_a = {},
                _a[key] = mergeState(models[key]),
                _a);
            var _a;
        })
            .reduce(arrayToObj, {});
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
        }
        else {
            state[key] = value;
        }
    }
    return state;
}
exports.updateStateAtPath = updateStateAtPath;
function recursivelyUpdateComputedState(model, state, path) {
    var currentModel = retrieveNestedModel(model, path);
    var currentState = getStateFromPath(state, path);
    var computedState = currentModel
        ? currentModel.computed ? currentModel.computed(currentState) : {}
        : model.computed ? model.computed(currentState) : {};
    if (path.length > 0) {
        var newState = updateStateAtPath(state, path, __assign({}, currentState, computedState));
        var newPath = path.slice(0, path.length - 1);
        return recursivelyUpdateComputedState(model, newState, newPath);
    }
    else {
        var newState = __assign({}, currentState, computedState);
        return newState;
    }
}
exports.recursivelyUpdateComputedState = recursivelyUpdateComputedState;
