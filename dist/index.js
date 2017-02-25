'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var dotProp = require('dot-prop');

function noop() {
  return null;
}

function arrayToObj(curr, prev) {
  return Object.assign({}, curr, prev);
}

function merge(model, prop) {
  if (model.models) {
    var child = Object.keys(model.models).map(function (key) {
      return _defineProperty({}, key, merge(model.models[key], prop));
    }).reduce(arrayToObj, {});

    return Object.assign({}, model[prop], child);
  }
  return model[prop];
}

function createState(model) {
  return merge(model, 'state');
}

function retrieveNestedModel(model, path) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (model.models) {
    var currModel = model.models[path[index]];
    if (currModel && currModel.models && currModel.models[path[index + 1]]) {
      return retrieveNestedModel(currModel, path, index + 1);
    }
    return currModel;
  }
  return model;
}

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

  var onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop;
  var onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop;

  return function (model) {
    var state = createState(model);
    var methods = createMethods(model, []);

    function decorateMethods(reducers, effects, path) {
      var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
        return _defineProperty({}, key, function () {
          var newState = void 0;
          if (path.length) {
            var localState = retrieveNestedModel(model, path).scoped ? dotProp.get(state, path.join('.')) : state;
            var newLocalState = Object.assign({}, localState, reducers[key].apply(reducers, [localState].concat(Array.prototype.slice.call(arguments))));
            dotProp.set(state, path.join('.'), newLocalState);
            newState = state;
          } else {
            newState = reducers[key].apply(reducers, [state].concat(Array.prototype.slice.call(arguments)));
          }
          onStateChange(newState, state, methods);
          onMethodCall.apply(undefined, [newState, state].concat(Array.prototype.slice.call(arguments)));
          state = newState;
          return newState;
        });
      });
      var decoratedEffects = Object.keys(effects || {}).map(function (key) {
        return _defineProperty({}, key, function () {
          if (path.length) {
            var nestedModel = retrieveNestedModel(model, path);
            var effectState = nestedModel.scoped ? nestedModel.state : state;
            var effectMethods = nestedModel.scoped ? dotProp.get(methods, path.join('.')) : methods;
            return effects[key].apply(effects, [effectState, effectMethods].concat(Array.prototype.slice.call(arguments)));
          }
          return effects[key].apply(effects, [state, methods].concat(Array.prototype.slice.call(arguments)));
        });
      });
      return decoratedReducers.concat(decoratedEffects).reduce(arrayToObj, {});
    }

    function createMethods(model, path) {
      if (model.models) {
        var child = Object.keys(model.models).map(function (key) {
          return _defineProperty({}, key, createMethods(model.models[key], path.concat(key)));
        }).reduce(arrayToObj, {});
        return Object.assign({}, decorateMethods(model.reducers, model.effects, path), child);
      }
      return decorateMethods(model.reducers, model.effects, path);
    }

    return {
      state: state,
      methods: methods
    };
  };
};