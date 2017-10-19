"use strict";
exports.__esModule = true;
function onStateChange(plugins, state, prev, actions) {
    return plugins.map(function (plugin) {
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
    return plugins.map(function (plugin) {
        if (typeof plugin === 'object' && plugin.onReducerCalled) {
            plugin.onReducerCalled.apply(null, [state, prev, name].concat(args));
        }
    });
}
exports.onReducerCalled = onReducerCalled;
function onEffectCalled(plugins, prev, name, args) {
    return plugins.map(function (plugin) {
        if (typeof plugin === 'object' && plugin.onEffectCalled) {
            plugin.onEffectCalled.apply(null, [prev, name].concat(args));
        }
    });
}
exports.onEffectCalled = onEffectCalled;
function wrapReducer(plugins, reducer) {
    return plugins.reduce(function (prev, plugin) {
        if (typeof plugin === 'object' && plugin.wrapReducers) {
            return plugin.wrapReducers(prev);
        }
        else {
            return prev;
        }
    }, reducer);
}
exports.wrapReducer = wrapReducer;
function wrapEffect(plugins, effect) {
    return plugins.reduce(function (prev, plugin) {
        if (typeof plugin === 'object' && plugin.wrapEffects) {
            return plugin.wrapEffects(prev);
        }
        else {
            return prev;
        }
    }, effect);
}
exports.wrapEffect = wrapEffect;
