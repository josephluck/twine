'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var test = require('tape');
var store = require('./index');
var noop = function noop() {
  return null;
};

// Readme examples
test('store / readme / example 1', function (t) {
  t.plan(3);
  var subscription = function subscription(state) {
    t.equal(state.title, 'bar');
  };
  var model = {
    state: {
      title: 'foo'
    },
    reducers: {
      update: function update(state, title) {
        return {
          title: title
        };
      }
    },
    effects: {
      async: function async(state, methods, timeout) {
        setTimeout(function () {
          t.equal(_typeof(methods.update), 'function', 'effect called and received methods');
          t.equal(state.title, 'bar', 'effect called and received latest state');
        }, timeout);
      }
    }
  };
  var app = store(subscription)(model);
  app.methods.update('bar');
  app.methods.async(1);
});
test('store / readme / example 2', function (t) {
  t.plan(6);
  var app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo: function foo() {
        t.pass('level one reducer called');
      }
    },
    models: {
      levelTwo: {
        state: {
          foo: 'bar'
        },
        reducers: {
          foo: function foo() {
            t.pass('level two reducer called');
          }
        },
        models: {
          levelThree: {
            state: {
              foo: 'baz'
            },
            reducers: {
              foo: function foo() {
                t.pass('level three reducer called');
              }
            }
          }
        }
      }
    }
  });
  app.methods.foo();
  app.methods.levelTwo.foo();
  app.methods.levelTwo.levelThree.foo();
  t.equal(app.state.foo, 'foo', 'level one state is correct');
  t.equal(app.state.levelTwo.foo, 'bar', 'level two state is correct');
  t.equal(app.state.levelTwo.levelThree.foo, 'baz', 'level three state is correct');
});

// Return of store setup
test('store / return / methods contain reducers', function (t) {
  t.plan(2);
  var app = store()({
    reducers: {
      myReducer: function myReducer() {}
    }
  });
  t.equal(_typeof(app.methods), 'object', 'methods is an object');
  t.equal(_typeof(app.methods.myReducer), 'function', 'reducer exists inside methods');
});
test.skip('skip / store / return / state is available');

// Reducers
test('store / reducers / receive state', function (t) {
  t.plan(1);
  var app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      setTitle: function setTitle(state) {
        t.equal(state.title, 'not set', 'reducer received state');
      }
    }
  });
  app.methods.setTitle();
});
test('store / reducers / receive latest state', function (t) {
  t.plan(1);
  var app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      updateTitle: function updateTitle(state, title) {
        return {
          title: title
        };
      },
      checkLatestState: function checkLatestState(state) {
        t.equal(state.title, 'updated title', 'reducer received latest state');
      }
    }
  });
  app.methods.updateTitle('updated title');
  app.methods.checkLatestState();
});
test('store / reducers / receive multiple arguments', function (t) {
  t.plan(2);
  var app = store()({
    reducers: {
      setTitle: function setTitle(state, title, other) {
        t.equal(title, 'foo', 'first argument is okay');
        t.equal(other, 123, 'second argument is okay');
      }
    }
  });
  app.methods.setTitle('foo', 123);
});
test('store / reducers / return from invocation', function (t) {
  t.plan(2);
  var app = store()({
    reducers: {
      firstReducer: function firstReducer(state, title) {
        return title;
      },
      secondReducer: function secondReducer() {
        return 123;
      }
    }
  });
  var firstReducerReturn = app.methods.firstReducer('bar');
  t.equal(firstReducerReturn, 'bar', 'first reducer returned correctly');
  var secondReducerReturn = app.methods.secondReducer();
  t.equal(typeof secondReducerReturn === 'undefined' ? 'undefined' : _typeof(secondReducerReturn), 'number', 'second reducer returned correctly');
});

// Subscription
test('store / subscription / called on state changes', function (t) {
  t.plan(1);
  var app = store(t.pass)({
    reducers: {
      myReducer: function myReducer() {
        return 'subscription called';
      }
    }
  });
  app.methods.myReducer();
});
test('store / subscription / receives new state and prev state', function (t) {
  t.plan(2);
  var checkState = function checkState(newState, oldState) {
    t.equal(oldState, 'not set', 'received previous state');
    t.equal(newState, 'set', 'received new state');
  };
  var app = store(checkState)({
    state: 'not set',
    reducers: {
      myReducer: function myReducer() {
        return 'set';
      }
    }
  });
  app.methods.myReducer();
});

// Hooks
test('store / hooks', function (t) {
  t.plan(7);
  var hooks = {
    onMethodCall: function onMethodCall(state, prev) {
      t.pass('hook called on method call');
      t.equal(prev.title, 'not set', 'onMethodCall hook received correct prev state');
      t.equal(state.title, 'set', 'onMethodCall hook received correct new state');
      t.equal(arguments.length <= 2 ? undefined : arguments[2], 'set', 'onMethodCall hook received arguments');
    },
    onStateChange: function onStateChange(state, prev) {
      t.pass('hook called on state change');
      t.equal(prev.title, 'not set', 'onStateChange hook received correct prev state');
      t.equal(state.title, 'set', 'onStateChange hook received correct new state');
    }
  };
  var app = store(hooks)({
    state: {
      title: 'not set'
    },
    reducers: {
      setTitle: function setTitle(state, title) {
        return {
          title: title
        };
      }
    }
  });
  app.methods.setTitle('set');
});

// Effects
test('store / effects / receive state', function (t) {
  t.plan(1);
  var app = store()({
    state: {
      title: 'not set'
    },
    effects: {
      setTitle: function setTitle(state) {
        t.equal(state.title, 'not set', 'reducer received state');
      }
    }
  });
  app.methods.setTitle();
});
test('store / effects / receive latest state', function (t) {
  t.plan(1);
  var app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      updateTitle: function updateTitle(state, title) {
        return {
          title: title
        };
      }
    },
    effects: {
      checkLatestState: function checkLatestState(state) {
        t.equal(state.title, 'updated title', 'reducer received state');
      }
    }
  });
  app.methods.updateTitle('updated title');
  app.methods.checkLatestState();
});
test('store / effects / receive other methods', function (t) {
  t.plan(2);
  var app = store()({
    state: {},
    reducers: {
      foo: noop
    },
    effects: {
      myOtherEffect: noop,
      setTitle: function setTitle(state, methods) {
        t.equal(_typeof(methods.foo), 'function', 'effect received other reducer method');
        t.equal(_typeof(methods.myOtherEffect), 'function', 'effect received other effect method');
      }
    }
  });
  app.methods.setTitle();
});
test('store / effects / receive multiple arguments', function (t) {
  t.plan(3);
  var app = store()({
    state: {},
    effects: {
      foo: function foo(state, methods, _foo, bar, baz) {
        t.equal(_foo, 'foo', 'effect received first argument');
        t.equal(bar, 'bar', 'effect received second argument');
        t.equal(baz, 'baz', 'effect received third argument');
      }
    }
  });
  app.methods.foo('foo', 'bar', 'baz');
});
test('store / effects / return from invocation', function (t) {
  t.plan(1);
  var app = store()({
    state: {},
    effects: {
      foo: function foo() {
        return 123;
      }
    }
  });
  t.equal(_typeof(app.methods.foo()), 'number', 'effect returned from invocation');
});
test('store / effects / can be chained when using promises', function (t) {
  t.plan(1);
  var app = store()({
    state: {},
    effects: {
      foo: function foo() {
        return Promise.resolve();
      },
      bar: function bar() {
        t.pass('the second effect was called after the first effects returned promise resolved');
      }
    }
  });
  app.methods.foo().then(function () {
    return app.methods.bar();
  });
});
test('store / effects / can be chained when using callbacks', function (t) {
  t.plan(1);
  var app = store()({
    state: {},
    effects: {
      foo: function foo(state, methods, _foo2, done) {
        done(_foo2);
        return _foo2;
      },
      bar: function bar() {
        t.pass('the second effect was called after the first effects callback was called');
      }
    }
  });
  app.methods.foo('foo', function () {
    app.methods.bar();
  });
});

// Composition
test('store / composition / composition merges state together', function (t) {
  t.plan(2);
  var app = store()({
    state: {
      foo: 'foo'
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        }
      }
    }
  });
  t.equal(app.state.foo, 'foo', 'parent state is okay');
  if (app.state.bar) {
    t.equal(app.state.bar.baz, 'baz', 'child state is okay');
  } else {
    t.fail('child state has not been merged');
  }
});
test('store / composition / composition works with methods', function (t) {
  t.plan(2);
  var app = store()({
    reducers: {
      foo: noop
    },
    models: {
      bar: {
        reducers: {
          baz: noop
        }
      }
    }
  });
  t.equal(_typeof(app.methods.foo), 'function', 'parent methods are okay');
  if (app.methods.bar) {
    t.equal(_typeof(app.methods.bar.baz), 'function', 'child methods are okay');
  } else {
    t.fail('child method has not been merged');
  }
});
test('store / composition / reducers receive state', function (t) {
  t.plan(4);
  var app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo: function foo(state) {
        t.equal(state.foo, 'foo', 'parent reducer received state');
        t.equal(state.bar.baz, 'baz', 'parent reducer can access child state');
        return state;
      }
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        },
        reducers: {
          baz: function baz(state) {
            t.equal(state.bar.baz, 'baz', 'child reducer received state');
            t.equal(state.foo, 'foo', 'child reducer cannot access parent state');
            return state;
          }
        }
      }
    }
  });
  app.methods.foo();
  app.methods.bar.baz();
});
test('store / composition / effects receive state', function (t) {
  t.plan(4);
  var app = store()({
    state: {
      foo: 'foo'
    },
    effects: {
      foo: function foo(state) {
        t.equal(state.foo, 'foo', 'parent effect received state');
        t.equal(state.bar.baz, 'baz', 'parent effect can access child state');
      }
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        },
        effects: {
          baz: function baz(state) {
            t.equal(state.bar.baz, 'baz', 'child effect received state');
            t.equal(state.foo, 'foo', 'child effect cannot access parent state');
          }
        }
      }
    }
  });
  app.methods.foo();
  app.methods.bar.baz();
});
test('store / composition / effects receive child methods', function (t) {
  t.plan(8);
  var app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      qaz: noop
    },
    effects: {
      foo: function foo(state, methods) {
        t.equal(_typeof(methods.foo), 'function', 'parent effect can call parent effect');
        t.equal(_typeof(methods.qaz), 'function', 'parent effect can call parent reducer');
        t.equal(_typeof(methods.bar.baz), 'function', 'parent effect can call child effect');
        t.equal(_typeof(methods.bar.quuz), 'function', 'parent effect can call child reducer');
      }
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        },
        reducers: {
          quuz: noop
        },
        effects: {
          baz: function baz(state, methods) {
            t.equal(_typeof(methods.foo), 'function', 'child effect can call parent effect');
            t.equal(_typeof(methods.qaz), 'function', 'child effect can call parent reducer');
            t.equal(_typeof(methods.bar.baz), 'function', 'child effect can call child effect');
            t.equal(_typeof(methods.bar.quuz), 'function', 'child effect can call child reducer');
          }
        }
      }
    }
  });
  app.methods.foo();
  app.methods.bar.baz();
});

// Not sure whether to implement run-time registrations
test.skip('skip /store / composition / register child model at run time calls subscribe with merged state', function (t) {
  t.plan(3);
  var app = store({
    state: {
      foo: 'foo'
    },
    reducers: {
      myReducer: noop
    }
  });
  app.subscribe(function (state) {
    t.pass('subscribe is called');
    t.equal(state.foo, 'foo', 'parent model state is maintained');
    t.equal(state.foo.bar, 'bar', 'child model state is merged');
  });
  setTimeout(function () {
    app.models.register('bar', {
      state: {
        bar: 'bar'
      }
    });
  }, 10);
});
test.skip('skip / store / composition / register child model at run time allows methods from parent and child to be called', function (t) {
  t.plan(2);
  var app = store({
    reducers: {
      myReducer: noop
    }
  });
  app.subscribe(noop);
  setTimeout(function () {
    app.models.register('foo', {
      reducers: {
        myNestedReducer: noop
      }
    });
    app.methods.myReducer(function () {
      return t.pass('parent reducer was called');
    });
    app.methods.foo.myNestedReducer(function () {
      return t.pass('child reducer was called');
    });
  }, 10);
});

// Scoping
test('store / scoped / reducers receive local state', function (t) {
  t.plan(2);
  var app = store()({
    state: {
      title: 'not set'
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1
        },
        reducers: {
          increment: function increment(localState) {
            t.equal(localState.count, 1, 'first level reducer received local state');
          }
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey'
            },
            reducers: {
              update: function update(localState) {
                t.equal(localState.myState, 'hey', 'second level reducer received local state');
              }
            }
          }
        }
      }
    }
  });
  app.methods.counter.increment();
  app.methods.counter.anotherModel.update();
});
test('store / scoped / effects receive local state and methods', function (t) {
  t.plan(4);
  var app = store()({
    state: {
      title: 'not set'
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1
        },
        reducers: {
          foo: function foo() {}
        },
        effects: {
          increment: function increment(localState, localMethods) {
            t.equal(localState.count, 1, 'first level effect received local state');
            t.equal(_typeof(localMethods.foo), 'function', 'first level effect received local methods');
          }
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey'
            },
            reducers: {
              bar: function bar() {}
            },
            effects: {
              update: function update(localState, localMethods) {
                t.equal(localState.myState, 'hey', 'second level effect received local state');
                t.equal(_typeof(localMethods.bar), 'function', 'second level effect received local methods');
              }
            }
          }
        }
      }
    }
  });
  app.methods.counter.increment();
  app.methods.counter.anotherModel.update();
});
test('store / scoped / reducers update local state effecting global state', function (t) {
  t.plan(4);
  function subscribe(state) {
    t.equal(state.title, 'not set', 'title remains unchanged');
    t.equal(state.counter.count, 1, 'count remains unchanged');
    t.equal(state.foo.bar, 'baz', 'foo bar remains unchanged');
    t.equal(state.counter.anotherModel.myState, 'updated', 'state updated');
  }
  var app = store(subscribe)({
    state: {
      title: 'not set'
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1
        },
        reducers: {},
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey'
            },
            reducers: {
              update: function update(localState) {
                return {
                  myState: 'updated'
                };
              }
            }
          }
        }
      },
      foo: {
        state: {
          bar: 'baz'
        }
      }
    }
  });
  app.methods.counter.anotherModel.update();
});
test.skip('store / scoped / effects receive local methods that update global state', function (t) {});
test.skip('skip / store / scoped / hooks still work as expected with global state', function (t) {});