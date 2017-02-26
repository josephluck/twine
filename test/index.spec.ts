require('es6-shim')
import * as test from 'tape'
import twine from '../src/index'
const noop = () => null

// Readme examples
test('twine / readme / example 1', function (t) {
  t.plan(3)
  const subscription = function (state) {
    t.equal(state.title, 'bar')
  }
  const model = {
    state: {
      title: 'foo',
    },
    reducers: {
      update (state, title) {
        return {
          title: title,
        }
      }
    },
    effects: {
      async (state, methods, timeout) {
        setTimeout(function () {
          t.equal(typeof methods.update, 'function', 'effect called and received methods')
          t.equal(state.title, 'bar', 'effect called and received latest state')
        }, timeout)
      },
    },
  }
  const app = twine(subscription)(model)
  app.methods.update('bar')
  app.methods.async(1)
})
test('twine / readme / example 2', function (t) {
  t.plan(6)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    reducers: {
      foo: function () {
        t.pass('level one reducer called')
      },
    },
    models: {
      levelTwo: {
        state: {
          foo: 'bar',
        },
        reducers: {
          foo: function () {
            t.pass('level two reducer called')
          },
        },
        models: {
          levelThree: {
            state: {
              foo: 'baz',
            },
            reducers: {
              foo: function () {
                t.pass('level three reducer called')
              },
            },
          },
        },
      },
    },
  })
  app.methods.foo()
  app.methods.levelTwo.foo()
  app.methods.levelTwo.levelThree.foo()
  t.equal(app.state.foo, 'foo', 'level one state is correct')
  t.equal(app.state.levelTwo.foo, 'bar', 'level two state is correct')
  t.equal(app.state.levelTwo.levelThree.foo, 'baz', 'level three state is correct')
})

// Return of twine setup
test('twine / return / methods contain reducers', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      myReducer () { return null },
    },
  })
  t.equal(typeof app.methods, 'object', 'methods is an object')
  t.equal(typeof app.methods.myReducer, 'function', 'reducer exists inside methods')
})
test.skip('skip / twine / return / state is available')

// Reducers
test('twine / reducers / receive state', function (t) {
  t.plan(1)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle (state) {
        t.equal(state.title, 'not set', 'reducer received state')
      },
    },
  })
  app.methods.setTitle()
})
test('twine / reducers / receive latest state', function (t) {
  t.plan(1)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle (state, title) {
        return {
          title: title,
        }
      },
      checkLatestState (state) {
        t.equal(state.title, 'updated title', 'reducer received latest state')
      },
    },
  })
  app.methods.updateTitle('updated title')
  app.methods.checkLatestState()
})
test('twine / reducers / receive multiple arguments', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      setTitle (state, title, other) {
        t.equal(title, 'foo', 'first argument is okay')
        t.equal(other, 123, 'second argument is okay')
      },
    },
  })
  app.methods.setTitle('foo', 123)
})
test('twine / reducers / return from invocation', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      firstReducer (state, title) {
        return title
      },
      secondReducer () {
        return 123
      },
    },
  })
  const firstReducerReturn = app.methods.firstReducer('bar')
  t.equal(firstReducerReturn, 'bar', 'first reducer returned correctly')
  const secondReducerReturn = app.methods.secondReducer()
  t.equal(typeof secondReducerReturn, 'number', 'second reducer returned correctly')
})

// Subscription
test('twine / subscription / called on state changes', function (t) {
  t.plan(1)
  const app = twine(t.pass)({
    state: {},
    reducers: {
      myReducer () {
        return 'subscription called'
      },
    },
  })
  app.methods.myReducer()
})
test('twine / subscription / receives new state and prev state', function (t) {
  t.plan(2)
  const checkState = function (newState, oldState) {
    t.equal(oldState, 'not set', 'received previous state')
    t.equal(newState, 'set', 'received new state')
  }
  const app = twine(checkState)({
    state: 'not set',
    reducers: {
      myReducer () {
        return 'set'
      },
    },
  })
  app.methods.myReducer()
})

// Hooks
test('twine / hooks', function (t) {
  t.plan(7)
  const hooks = {
    onMethodCall (state, prev, ...args) {
      t.pass('hook called on method call')
      t.equal(prev.title, 'not set', 'onMethodCall hook received correct prev state')
      t.equal(state.title, 'set', 'onMethodCall hook received correct new state')
      t.equal(args[0], 'set', 'onMethodCall hook received arguments')
    },
    onStateChange (state, prev) {
      t.pass('hook called on state change')
      t.equal(prev.title, 'not set', 'onStateChange hook received correct prev state')
      t.equal(state.title, 'set', 'onStateChange hook received correct new state')
    },
  }
  const app = twine(hooks)({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle (state, title) {
        return {
          title: title,
        }
      },
    },
  })
  app.methods.setTitle('set')
})

// Effects
test('twine / effects / receive state', function (t) {
  t.plan(1)
  const app = twine()({
    state: {
      title: 'not set',
    },
    effects: {
      setTitle (state) {
        t.equal(state.title, 'not set', 'reducer received state')
      },
    },
  })
  app.methods.setTitle()
})
test('twine / effects / receive latest state', function (t) {
  t.plan(1)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle (state, title) {
        return {
          title: title,
        }
      },
    },
    effects: {
      checkLatestState (state) {
        t.equal(state.title, 'updated title', 'reducer received state')
      },
    },
  })
  app.methods.updateTitle('updated title')
  app.methods.checkLatestState()
})
test('twine / effects / receive other methods', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      foo: noop,
    },
    effects: {
      myOtherEffect: noop,
      setTitle (state, methods) {
        t.equal(typeof methods.foo, 'function', 'effect received other reducer method')
        t.equal(typeof methods.myOtherEffect, 'function', 'effect received other effect method')
      },
    },
  })
  app.methods.setTitle()
})
test('twine / effects / receive multiple arguments', function (t) {
  t.plan(3)
  const app = twine()({
    state: {},
    effects: {
      foo (state, methods, foo, bar, baz) {
        t.equal(foo, 'foo', 'effect received first argument')
        t.equal(bar, 'bar', 'effect received second argument')
        t.equal(baz, 'baz', 'effect received third argument')
      },
    },
  })
  app.methods.foo('foo', 'bar', 'baz')
})
test('twine / effects / return from invocation', function (t) {
  t.plan(1)
  const app = twine()({
    state: {},
    effects: {
      foo () {
        return 123
      },
    },
  })
  t.equal(typeof app.methods.foo(), 'number', 'effect returned from invocation')
})
test('twine / effects / can be chained when using promises', function (t) {
  t.plan(1)
  const app = twine()({
    state: {},
    effects: {
      foo () {
        return Promise.resolve()
      },
      bar () {
        t.pass('the second effect was called after the first effects returned promise resolved')
      },
    },
  })
  app.methods.foo()
    .then(() => app.methods.bar())
})
test('twine / effects / can be chained when using callbacks', function (t) {
  t.plan(1)
  const app = twine()({
    state: {},
    effects: {
      foo (state, methods, foo, done) {
        console.log(foo, done)
        done(foo)
        return foo
      },
      bar () {
        t.pass('the second effect was called after the first effects callback was called')
      },
    },
  })
  app.methods.foo('foo', () => {
    app.methods.bar()
  })
})

// Composition
test('twine / composition / composition merges state together', function (t) {
  t.plan(2)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    models: {
      bar: {
        state: {
          baz: 'baz',
        },
      },
    },
  })
  t.equal(app.state.foo, 'foo', 'parent state is okay')
  if (app.state.bar) {
    t.equal(app.state.bar.baz, 'baz', 'child state is okay')
  } else {
    t.fail('child state has not been merged')
  }
})
test('twine / composition / composition works with methods', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      foo: noop,
    },
    models: {
      bar: {
        state: {},
        reducers: {
          baz: noop,
        },
      },
    },
  })
  t.equal(typeof app.methods.foo, 'function', 'parent methods are okay')
  if (app.methods.bar) {
    t.equal(typeof app.methods.bar.baz, 'function', 'child methods are okay')
  } else {
    t.fail('child method has not been merged')
  }
})
test('twine / composition / reducers receive state', function (t) {
  t.plan(4)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    reducers: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent reducer received state')
        t.equal(state.bar.baz, 'baz', 'parent reducer can access child state')
        return state
      },
    },
    models: {
      bar: {
        state: {
          baz: 'baz',
        },
        reducers: {
          baz (state) {
            t.equal(state.bar.baz, 'baz', 'child reducer received state')
            t.equal(state.foo, 'foo', 'child reducer cannot access parent state')
            return state
          },
        },
      },
    },
  })
  app.methods.foo()
  app.methods.bar.baz()
})
test('twine / composition / effects receive state', function (t) {
  t.plan(4)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    effects: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent effect received state')
        t.equal(state.bar.baz, 'baz', 'parent effect can access child state')
      },
    },
    models: {
      bar: {
        state: {
          baz: 'baz',
        },
        effects: {
          baz (state) {
            t.equal(state.bar.baz, 'baz', 'child effect received state')
            t.equal(state.foo, 'foo', 'child effect cannot access parent state')
          },
        },
      },
    },
  })
  app.methods.foo()
  app.methods.bar.baz()
})
test('twine / composition / effects receive child methods', function (t) {
  t.plan(8)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    reducers: {
      qaz: noop,
    },
    effects: {
      foo (state, methods) {
        t.equal(typeof methods.foo, 'function', 'parent effect can call parent effect')
        t.equal(typeof methods.qaz, 'function', 'parent effect can call parent reducer')
        t.equal(typeof methods.bar.baz, 'function', 'parent effect can call child effect')
        t.equal(typeof methods.bar.quuz, 'function', 'parent effect can call child reducer')
      },
    },
    models: {
      bar: {
        state: {
          baz: 'baz',
        },
        reducers: {
          quuz: noop,
        },
        effects: {
          baz (state, methods) {
            t.equal(typeof methods.foo, 'function', 'child effect can call parent effect')
            t.equal(typeof methods.qaz, 'function', 'child effect can call parent reducer')
            t.equal(typeof methods.bar.baz, 'function', 'child effect can call child effect')
            t.equal(typeof methods.bar.quuz, 'function', 'child effect can call child reducer')
          },
        },
      },
    },
  })
  app.methods.foo()
  app.methods.bar.baz()
})

// Scoping
test('twine / scoped / reducers receive local state', function (t) {
  t.plan(2)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1,
        },
        reducers: {
          increment (localState) {
            t.equal(localState.count, 1, 'first level reducer received local state')
          },
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
            },
            reducers: {
              update (localState) {
                t.equal(localState.myState, 'hey', 'second level reducer received local state')
              },
            },
          },
        },
      },
    },
  })
  app.methods.counter.increment()
  app.methods.counter.anotherModel.update()
})
test('twine / scoped / effects receive local state and methods', function (t) {
  t.plan(4)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1,
        },
        reducers: {
          foo () {},
        },
        effects: {
          increment (localState, localMethods) {
            t.equal(localState.count, 1, 'first level effect received local state')
            t.equal(typeof localMethods.foo, 'function', 'first level effect received local methods')
          },
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
            },
            reducers: {
              bar () {},
            },
            effects: {
              update (localState, localMethods) {
                t.equal(localState.myState, 'hey', 'second level effect received local state')
                t.equal(typeof localMethods.bar, 'function', 'second level effect received local methods')
              },
            },
          },
        },
      },
    },
  })
  app.methods.counter.increment()
  app.methods.counter.anotherModel.update()
})
test('twine / scoped / reducers update local state effecting global state', function (t) {
  t.plan(8)
  function subscribeOne (state) {
    t.equal(state.title, 'not set', 'title remains unchanged')
    t.equal(state.counter.count, 1, 'count remains unchanged')
    t.equal(state.foo.bar, 'baz', 'foo bar remains unchanged')
    t.equal(state.counter.anotherModel.myState, 'updated', 'state updated')
  }
  const appOne = twine(subscribeOne)({
    state: {
      title: 'not set',
    },
    reducers: {},
    models: {
      counter: {
        scoped: true,
        state: {
          count: 1,
        },
        reducers: {},
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
            },
            reducers: {
              update (localState) {
                return {
                  myState: 'updated',
                }
              },
            },
          },
        },
      },
      foo: {
        state: {
          bar: 'baz',
        },
      },
    },
  })
  appOne.methods.counter.anotherModel.update()


  function subscribeTwo (state) {
    t.equal(state.title, 'not set', 'title remains unchanged')
    t.equal(state.counter.count, 2, 'count updated')
    t.equal(state.foo.bar, 'baz', 'foo bar remains unchanged')
    t.equal(state.counter.anotherModel.myState, 'hey', 'state remains unchanged')
  }
  const appTwo = twine(subscribeTwo)({
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
          increment (state) {
            return {
              count: state.count + 1
            }
          }
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey'
            },
            reducers: {}
          }
        }
      },
      foo: {
        state: {
          bar: 'baz'
        }
      }
    }
  })
  appTwo.methods.counter.increment()
})
test.skip('skip / twine / scoped / effects receive local methods that update global state', function (t) {

})
test.skip('skip / twine / scoped / hooks still work as expected with global state', function (t) {
})