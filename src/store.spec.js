const test = require('tape')
const store = require('./store')
const noop = () => null

test('store / return / methods contain reducers', function (t) {
  t.plan(2)
  const app = store({
    reducers: {
      myReducer () {}
    }
  })
  t.equal(typeof app.methods, 'object', 'methods is an object')
  t.equal(typeof app.methods.myReducer, 'function', 'reducer exists inside methods')
})
test.skip('store / return / state is available')

// Reducers
test('store / reducers / receive state', function (t) {
  t.plan(1)
  const app = store({
    state: {
      title: 'not set'
    },
    reducers: {
      setTitle (state) {
        t.equal(state.title, 'not set', 'reducer received state')
      }
    }
  })
  app.subscribe(noop)
  app.methods.setTitle()
})
test('store / reducers / receive multiple arguments', function (t) {
  t.plan(2)
  const app = store({
    reducers: {
      setTitle (state, title, other) {
        t.equal(title, 'foo', 'first argument is okay')
        t.equal(other, 123, 'second argument is okay')
      }
    }
  })
  app.subscribe(noop)
  app.methods.setTitle('foo', 123)
})
test('store / reducers / return from invocation', function (t) {
  t.plan(2)
  const app = store({
    reducers: {
      firstReducer (state, title) {
        return title
      },
      secondReducer () {
        return 123
      }
    }
  })
  app.subscribe(noop)
  const firstReducerReturn = app.methods.firstReducer('bar')
  t.equal(firstReducerReturn, 'bar', 'first reducer returned correctly')
  const secondReducerReturn = app.methods.secondReducer()
  t.equal(typeof secondReducerReturn, 'number', 'second reducer returned correctly')
})

// Subscription
test('store / subscription / called on state changes', function (t) {
  t.plan(1)
  const app = store({
    reducers: {
      myReducer () {
        return 'subscription called'
      }
    }
  })
  app.subscribe(t.pass)
  app.methods.myReducer()
})
test('store / subscription / receives updated state as the first argument', function (t) {
  t.plan(1)
  const app = store({
    reducers: {
      myReducer () {
        return 'foo'
      }
    }
  })
  app.subscribe(function (state) {
    t.equal(state, 'foo', 'received updated state')
  })
  app.methods.myReducer()
})

// Effects
test.skip('store / effects / receive state', function (t) {
})
test.skip('store / effects / receive other methods', function (t) {
})
test.skip('store / effects / receive multiple arguments', function (t) {
})
test.skip('store / effects / return from invocation', function (t) {
})
test.skip('store / effects / can be chained when using promises', function (t) {
})
test.skip('store / effects / can be chained when using callbacks', function (t) {
})

// Composition
test('store / composition / composition merges state together', function (t) {
  t.plan(2)
  const app = store({
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
  const app = store({
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
  const app = store({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent reducer received state')
        t.equal(state.bar.baz, 'baz', 'parent reducer can access child state')
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
          }
        }
      }
    }
  })
  app.subscribe(noop)
  app.methods.foo()
  app.methods.bar.baz()
})
test.skip('store / composition / effects receive state', function (t) {
})
// Not sure whether to implement these below
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