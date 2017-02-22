'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function noop() {
  return null;
}

function merge(model, prop) {
  if (model.models) {
    var child = Object.keys(model.models).map(function (key) {
      return _defineProperty({}, key, merge(model.models[key], prop));
    }).reduce(function (curr, prev) {
      return Object.assign({}, curr, prev);
    }, {});

    return Object.assign({}, model[prop], child);
  }
  return model[prop];
}

function createState(model) {
  return merge(model, 'state');
}

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

  var onStateChange = typeof opts === 'function' ? opts : opts.onStateChange || noop;
  var onMethodCall = typeof opts === 'function' ? noop : opts.onMethodCall || noop;

  return function (model) {
    var state = createState(model);
    var methods = createMethods(model, state);

    function decorateMethods(reducers, effects) {
      var decoratedReducers = Object.keys(reducers || {}).map(function (key) {
        return _defineProperty({}, key, function () {
          newState = reducers[key].apply(reducers, [state].concat(Array.prototype.slice.call(arguments)));
          onStateChange(newState, state);
          onMethodCall.apply(undefined, [newState, state].concat(Array.prototype.slice.call(arguments)));
          state = newState;
          return newState;
        });
      });
      var decoratedEffects = Object.keys(effects || {}).map(function (key) {
        return _defineProperty({}, key, function () {
          onMethodCall.apply(undefined, [state].concat(Array.prototype.slice.call(arguments)));
          return effects[key].apply(effects, [state, methods].concat(Array.prototype.slice.call(arguments)));
        });
      });
      return decoratedReducers.concat(decoratedEffects).reduce(function (curr, prev) {
        return Object.assign({}, curr, prev);
      }, {});
    }

    function createMethods(model) {
      if (model.models) {
        var child = Object.keys(model.models).map(function (key) {
          return _defineProperty({}, key, createMethods(model.models[key]));
        }).reduce(function (curr, prev) {
          return Object.assign({}, curr, prev);
        }, {});
        return Object.assign({}, decorateMethods(model.reducers, model.effects), child);
      }
      return decorateMethods(model.reducers, model.effects);
    }

    return {
      state: state,
      methods: methods
    };
  };
};