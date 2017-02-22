const test = require('tape')
const store = require('./store')
const noop = () => null

// Readme examples
test('store / readme / example 1', function (t) {
  t.plan(3)
  const subscription = function (state) {
    t.equal(state.title, 'bar')
  }
  const model = {
    state: {
      title: 'foo'
    },
    reducers: {
      update (state, title) {
        return {
          title: title
        }
      }
    },
    effects: {
      async (state, methods, timeout) {
        setTimeout(function () {
          t.equal(typeof methods.update, 'function', 'effect called and received methods')
          t.equal(state.title, 'bar', 'effect called and received latest state')
        }, timeout)
      }
    }
  }
  const app = store(subscription)(model)
  app.methods.update('bar')
  app.methods.async(1000)
})
test('store / readme / example 2', function (t) {
  t.plan(6)
  const app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo: function () {
        t.pass('level one reducer called')
      }
    },
    models: {
      levelTwo: {
        state: {
          foo: 'bar'
        },
        reducers: {
          foo: function () {
            t.pass('level two reducer called')
          }
        },
        models: {
          levelThree: {
            state: {
              foo: 'baz'
            },
            reducers: {
              foo: function () {
                t.pass('level three reducer called')
              }
            }
          }
        }
      }
    }
  })
  app.methods.foo()
  app.methods.levelTwo.foo()
  app.methods.levelTwo.levelThree.foo()
  t.equal(app.state.foo, 'foo', 'level one state is correct')
  t.equal(app.state.levelTwo.foo, 'bar', 'level two state is correct')
  t.equal(app.state.levelTwo.levelThree.foo, 'baz', 'level three state is correct')
})

// Return of store setup
test('store / return / methods contain reducers', function (t) {
  t.plan(2)
  const app = store()({
    reducers: {
      myReducer () {}
    }
  })
  t.equal(typeof app.methods, 'object', 'methods is an object')
  t.equal(typeof app.methods.myReducer, 'function', 'reducer exists inside methods')
})
test.skip('skip / store / return / state is available')

// Reducers
test('store / reducers / receive state', function (t) {
  t.plan(1)
  const app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      setTitle (state) {
        t.equal(state.title, 'not set', 'reducer received state')
      }
    }
  })
  app.methods.setTitle()
})
test('store / reducers / receive latest state', function (t) {
  t.plan(1)
  const app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      updateTitle (state, title) {
        return {
          title: title
        }
      },
      checkLatestState (state) {
        t.equal(state.title, 'updated title', 'reducer received latest state')
      }
    }
  })
  app.methods.updateTitle('updated title')
  app.methods.checkLatestState()
})
test('store / reducers / receive multiple arguments', function (t) {
  t.plan(2)
  const app = store()({
    reducers: {
      setTitle (state, title, other) {
        t.equal(title, 'foo', 'first argument is okay')
        t.equal(other, 123, 'second argument is okay')
      }
    }
  })
  app.methods.setTitle('foo', 123)
})
test('store / reducers / return from invocation', function (t) {
  t.plan(2)
  const app = store()({
    reducers: {
      firstReducer (state, title) {
        return title
      },
      secondReducer () {
        return 123
      }
    }
  })
  const firstReducerReturn = app.methods.firstReducer('bar')
  t.equal(firstReducerReturn, 'bar', 'first reducer returned correctly')
  const secondReducerReturn = app.methods.secondReducer()
  t.equal(typeof secondReducerReturn, 'number', 'second reducer returned correctly')
})

// Subscription
test('store / subscription / called on state changes', function (t) {
  t.plan(1)
  const app = store(t.pass)({
    reducers: {
      myReducer () {
        return 'subscription called'
      }
    }
  })
  app.methods.myReducer()
})
test('store / subscription / receives updated state as the first argument', function (t) {
  t.plan(1)
  const checkState = function (state) {
    t.equal(state, 'foo', 'received updated state')
  }
  const app = store(checkState)({
    reducers: {
      myReducer () {
        return 'foo'
      }
    }
  })
  app.methods.myReducer()
})

// Effects
test('store / effects / receive state', function (t) {
  t.plan(1)
  const app = store()({
    state: {
      title: 'not set'
    },
    effects: {
      setTitle (state) {
        t.equal(state.title, 'not set', 'reducer received state')
      }
    }
  })
  app.methods.setTitle()
})
test('store / effects / receive latest state', function (t) {
  t.plan(1)
  const app = store()({
    state: {
      title: 'not set'
    },
    reducers: {
      updateTitle (state, title) {
        return {
          title: title
        }
      }
    },
    effects: {
      checkLatestState (state) {
        t.equal(state.title, 'updated title', 'reducer received state')
      }
    }
  })
  app.methods.updateTitle('updated title')
  app.methods.checkLatestState()
})
test('store / effects / receive other methods', function (t) {
  t.plan(2)
  const app = store()({
    state: {},
    reducers: {
      foo: noop
    },
    effects: {
      myOtherEffect: noop,
      setTitle (state, methods) {
        t.equal(typeof methods.foo, 'function', 'effect received other reducer method')
        t.equal(typeof methods.myOtherEffect, 'function', 'effect received other effect method')
      }
    }
  })
  app.methods.setTitle()
})
test('store / effects / receive multiple arguments', function (t) {
  t.plan(3)
  const app = store()({
    state: {},
    effects: {
      foo (state, methods, foo, bar, baz) {
        t.equal(foo, 'foo', 'effect received first argument')
        t.equal(bar, 'bar', 'effect received second argument')
        t.equal(baz, 'baz', 'effect received third argument')
      }
    }
  })
  app.methods.foo('foo', 'bar', 'baz')
})
test('store / effects / return from invocation', function (t) {
  t.plan(1)
  const app = store()({
    state: {},
    effects: {
      foo () {
        return 123
      }
    }
  })
  t.equal(typeof app.methods.foo(), 'number', 'effect returned from invocation')
})
test('store / effects / can be chained when using promises', function (t) {
  t.plan(1)
  const app = store()({
    state: {},
    effects: {
      foo () {
        return Promise.resolve()
      },
      bar () {
        t.pass('the second effect was called after the first effects returned promise resolved')
      }
    }
  })
  app.methods.foo()
    .then(() => app.methods.bar())
})
test('store / effects / can be chained when using callbacks', function (t) {
  t.plan(1)
  const app = store()({
    state: {},
    effects: {
      foo (state, methods, foo, done) {
        done(foo)
        return foo
      },
      bar () {
        t.pass('the second effect was called after the first effects callback was called')
      }
    }
  })
  app.methods.foo('foo', () => {
    app.methods.bar()
  })
})

// Composition
test('store / composition / composition merges state together', function (t) {
  t.plan(2)
  const app = store()({
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
  })
  t.equal(app.state.foo, 'foo', 'parent state is okay')
  if (app.state.bar) {
    t.equal(app.state.bar.baz, 'baz', 'child state is okay')
  } else {
    t.fail('child state has not been merged')
  }
})
test('store / composition / composition works with methods', function (t) {
  t.plan(2)
  const app = store()({
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
  })
  t.equal(typeof app.methods.foo, 'function', 'parent methods are okay')
  if (app.methods.bar) {
    t.equal(typeof app.methods.bar.baz, 'function', 'child methods are okay')
  } else {
    t.fail('child method has not been merged')
  }
})
test('store / composition / reducers receive state', function (t) {
  t.plan(4)
  const app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent reducer received state')
        t.equal(state.bar.baz, 'baz', 'parent reducer can access child state')
        return state
      }
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        },
        reducers: {
          baz (state) {
            t.equal(state.bar.baz, 'baz', 'child reducer received state')
            t.equal(state.foo, 'foo', 'child reducer cannot access parent state')
            return state
          }
        }
      }
    }
  })
  app.methods.foo()
  app.methods.bar.baz()
})
test('store / composition / effects receive state', function (t) {
  t.plan(4)
  const app = store()({
    state: {
      foo: 'foo'
    },
    effects: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent effect received state')
        t.equal(state.bar.baz, 'baz', 'parent effect can access child state')
      }
    },
    models: {
      bar: {
        state: {
          baz: 'baz'
        },
        effects: {
          baz (state) {
            t.equal(state.bar.baz, 'baz', 'child effect received state')
            t.equal(state.foo, 'foo', 'child effect cannot access parent state')
          }
        }
      }
    }
  })
  app.methods.foo()
  app.methods.bar.baz()
})
test('store / composition / effects receive child methods', function (t) {
  t.plan(8)
  const app = store()({
    state: {
      foo: 'foo'
    },
    reducers: {
      qaz: noop
    },
    effects: {
      foo (state, methods) {
        t.equal(typeof methods.foo, 'function', 'parent effect can call parent effect')
        t.equal(typeof methods.qaz, 'function', 'parent effect can call parent reducer')
        t.equal(typeof methods.bar.baz, 'function', 'parent effect can call child effect')
        t.equal(typeof methods.bar.quuz, 'function', 'parent effect can call child reducer')
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
          baz (state, methods) {
            t.equal(typeof methods.foo, 'function', 'child effect can call parent effect')
            t.equal(typeof methods.qaz, 'function', 'child effect can call parent reducer')
            t.equal(typeof methods.bar.baz, 'function', 'child effect can call child effect')
            t.equal(typeof methods.bar.quuz, 'function', 'child effect can call child reducer')
          }
        }
      }
    }
  })
  app.methods.foo()
  app.methods.bar.baz()
})

// Not sure whether to implement run-time registrations
test.skip('store / composition / register child model at run time calls subscribe with merged state', function (t) {
  t.plan(3)
  const app = store({
    state: {
      foo: 'foo'
    },
    reducers: {
      myReducer: noop
    }
  })
  app.subscribe((state) => {
    t.pass('subscribe is called')
    t.equal(state.foo, 'foo', 'parent model state is maintained')
    t.equal(state.foo.bar, 'bar', 'child model state is merged')
  })
  setTimeout(() => {
    app.models.register('bar', {
      state: {
        bar: 'bar'
      }
    })
  }, 10)
})
test.skip('store / composition / register child model at run time allows methods from parent and child to be called', function (t) {
  t.plan(2)
  const app = store({
    reducers: {
      myReducer: noop
    }
  })
  app.subscribe(noop)
  setTimeout(() => {
    app.models.register('foo', {
      reducers: {
        myNestedReducer: noop
      }
    })
    app.methods.myReducer(() => t.pass('parent reducer was called'))
    app.methods.foo.myNestedReducer(() => t.pass('child reducer was called'))
  }, 10)
})

// Scoping
test.skip('store / scoped / reducers receive local state', function (t) {
})
test.skip('store / scoped / effects receive local state', function (t) {
})
test.skip('store / scoped / effects receive local methods', function (t) {
})
test.skip('store / scoped / reducers return local state', function (t) {
})
test.skip('store / scoped / reducers update local state effecting global state', function (t) {
})
test.skip('store / scoped / subscribe called when reducer returns', function (t) {
})