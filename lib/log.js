"use strict";
exports.__esModule = true;
exports["default"] = {
    onReducerCalled: function (state, prev, name) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        console.groupCollapsed("\uD83D\uDE80 Reducer: " + name);
        console.log('📦 prev:         ', prev);
        console.log.apply(this, ['⚡️ arguments:    '].concat(args));
        console.log('📦 state:        ', state);
        console.groupEnd();
    },
    onEffectCalled: function (state, name) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        console.groupCollapsed("\uD83D\uDE80 Effect:  " + name);
        console.log('📦 state:         ', state);
        console.log.apply(this, ['⚡️ arguments:    '].concat(args));
        console.groupEnd();
    }
};
