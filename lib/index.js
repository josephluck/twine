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
        let child = Object.keys(model.models).map(key => ({
            [key]: merge(model.models[key], prop),
        })).reduce(arrayToObj, {});
        return Object.assign({}, model[prop], child);
    }
    return model[prop];
}
exports.merge = merge;
function createState(model) {
    return merge(model, 'state');
}
exports.createState = createState;
function retrieveNestedModel(model, path, index = 0) {
    if (model.models) {
        let currModel = model.models[path[index]];
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
        let key = path[0];
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
function onStateChange(plugins, state, prev, actions) {
    return plugins.map(plugin => {
        if (typeof plugin === 'function') {
            plugin(state, prev, actions);
        }
        else if (typeof plugin === 'object' && plugin.onStateChange) {
            plugin.onStateChange(state, prev, actions);
        }
    });
}
exports.onStateChange = onStateChange;
function onReducerCalled(plugins, state, prev, name, args) {
    return plugins.map(plugin => {
        if (typeof plugin === 'object' && plugin.onReducerCalled) {
            plugin.onReducerCalled.apply(null, [state, prev, name].concat(args));
        }
    });
}
exports.onReducerCalled = onReducerCalled;
function onEffectCalled(plugins, prev, name, args) {
    return plugins.map(plugin => {
        if (typeof plugin === 'object' && plugin.onEffectCalled) {
            plugin.onEffectCalled.apply(null, [prev, name].concat(args));
        }
    });
}
exports.onEffectCalled = onEffectCalled;
function twine(opts) {
    if (!opts) {
        opts = noop;
    }
    let plugins = typeof opts === 'object' && Array.isArray(opts) ? opts : [opts];
    return function output(model) {
        let state = createState(model);
        let actions = createActions(model, []);
        function decorateActions(reducers, effects, path) {
            const decoratedReducers = Object.keys(reducers || {}).map(key => ({
                [key]: function () {
                    let reducer = reducers[key];
                    let nestedModel = retrieveNestedModel(model, path);
                    let oldState = Object.assign({}, state);
                    let localState = path.length ? getNestedObjFromPath(state, path) : state;
                    let reducerArgs = [localState].concat(Array.prototype.slice.call(arguments));
                    let reducerResponse = reducer.apply(null, reducerArgs);
                    let newState = Object.assign({}, localState, reducerResponse);
                    let args = Array.prototype.slice.call(arguments);
                    state = path.length ? updateStateAtPath(state, path, newState) : newState;
                    onReducerCalled(plugins, state, oldState, reducer.name, args);
                    onStateChange(plugins, state, oldState, actions);
                    return path.length && nestedModel.scoped ? reducerResponse : state;
                },
            }));
            const decoratedEffects = Object.keys(effects || {}).map(key => ({
                [key]: function () {
                    const effect = effects[key];
                    if (path.length) {
                        let nestedModel = retrieveNestedModel(model, path);
                        let effectState = nestedModel.scoped ? getNestedObjFromPath(state, path) : state;
                        let effectActions = nestedModel.scoped ? getNestedObjFromPath(actions, path) : actions;
                        const args = Array.prototype.slice.call(arguments);
                        const effectArgs = [effectState, effectActions].concat(args);
                        onEffectCalled(plugins, state, effect.name, args);
                        return effects[key].apply(null, effectArgs);
                    }
                    const args = Array.prototype.slice.call(arguments);
                    const effectArgs = [state, actions].concat(args);
                    onEffectCalled(plugins, state, effect.name, args);
                    return effects[key].apply(null, effectArgs);
                },
            }));
            return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {});
        }
        function createActions(model, path) {
            if (model.models) {
                const child = Object.keys(model.models).map(key => ({
                    [key]: createActions(model.models[key], path.concat(key)),
                })).reduce(arrayToObj, {});
                return Object.assign({}, decorateActions(model.reducers, model.effects, path), child);
            }
            return decorateActions(model.reducers, model.effects, path);
        }
        return {
            state,
            actions,
        };
    };
}
exports.default = twine;
