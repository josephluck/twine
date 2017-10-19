"use strict";
exports.__esModule = true;
var log = {
    onReducerCalled: function (nextState, previousState, name, params) {
        console.groupCollapsed("\u2728 Reducer: " + name);
        console.log('📦 previous state:  ', previousState);
        console.log('⚡️ arguments:        ', params);
        console.log('📦 next state:      ', nextState);
        console.groupEnd();
    },
    onEffectCalled: function (state, name, params) {
        console.groupCollapsed("\uD83D\uDE80 Effect:  " + name);
        console.log('📦 state:           ', state);
        console.log('⚡️ arguments:        ', params);
        console.groupEnd();
    }
};
exports["default"] = log;
