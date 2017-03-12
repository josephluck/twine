import * as test from 'tape'
import twine, {getNestedObjFromPath, updateStateAtPath} from '../src/index'
const noop = () => null

test('twine / utils / gets nested state given array of keys', function (t) {
  t.plan(1)
  let state = {
    foo: 'foo',
    bar: {
      bar: 'bar',
      baz: {
        baz: 'baz',
      },
    },
  }
  let newBazState = {
    baz: 'baz updated',
  }
  let newState = updateStateAtPath(state, ['bar', 'baz'], newBazState)
  t.equal(newState.bar.baz, newBazState)
})

// app examples
test('twine / app / example 1', function (t) {
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
      async (state, actions, timeout) {
        setTimeout(function () {
          t.equal(typeof actions.update, 'function', 'effect called and received actions')
          t.equal(state.title, 'bar', 'effect called and received latest state')
        }, timeout)
      },
    },
  }
  const app = twine(subscription)(model)
  app.actions.update('bar')
  app.actions.async(1)
})
test('twine / app / example 2', function (t) {
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
  app.actions.foo()
  app.actions.levelTwo.foo()
  app.actions.levelTwo.levelThree.foo()
  t.equal(app.state.foo, 'foo', 'level one state is correct')
  t.equal(app.state.levelTwo.foo, 'bar', 'level two state is correct')
  t.equal(app.state.levelTwo.levelThree.foo, 'baz', 'level three state is correct')
})
test('twine / app / example 3', function (t) {
  t.plan(6)
  const model = {
    state: {},
    models: {
      alert: {
        state: {},
      },
      user: {
        state: {},
      },
      pages: {
        state: {},
        models: {
          login: {
            scoped: true,
            state: {
              username: 'joseph@example.com',
              password: 'password',
            },
            reducers: {
              setFormField (state, key, value) {
                return {
                  ...state,
                  [key]: value,
                }
              },
            },
            effects: {
              updateFormField (state, actions, key, value) {
                return actions.setFormField(key, value)
              },
            },
          },
        },
      },
    },
  }
  let _state
  const app = twine((state) => {
    _state = state
  })(model)

  app.actions.pages.login.setFormField('username', 'joseph@example.comm')
  t.equal(_state.pages.login.username, 'joseph@example.comm')
  t.equal(_state.pages.login.password, 'password')
  app.actions.pages.login.updateFormField('username', 'joseph@example.commm')
  t.equal(_state.pages.login.username, 'joseph@example.commm')
  t.equal(_state.pages.login.password, 'password')
  app.actions.pages.login.setFormField('username', 'chloe@example.co.uk')
  t.equal(_state.pages.login.username, 'chloe@example.co.uk')
  t.equal(_state.pages.login.password, 'password')
})

// Return of twine setup
test('twine / return / actions contain reducers', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      myReducer () { return null },
    },
  })
  t.equal(typeof app.actions, 'object', 'actions is an object')
  t.equal(typeof app.actions.myReducer, 'function', 'reducer exists inside actions')
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
  app.actions.setTitle()
})
test('twine / reducers / receive latest state', function (t) {
  t.plan(2)
  const app = twine()({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle (state, title) {
        return {
          title,
        }
      },
      checkLatestState (state) {
        t.equal(state.title, 'updated title', 'reducer received latest state')
        return state
      },
    },
    models: {
      nested: {
        state: {
          foo: 'not set',
        },
        reducers: {
          updateFoo (state, foo) {
            return {
              foo,
            }
          },
          checkLatestState (state) {
            t.equal(state.foo, 'updated foo', 'nested reducer received latest state')
            return state
          },
        },
      },
    },
  })
  app.actions.updateTitle('updated title')
  app.actions.checkLatestState()
  app.actions.nested.updateFoo('updated foo')
  app.actions.nested.checkLatestState()
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
  app.actions.setTitle('foo', 123)
})
test('twine / reducers / return from invocation', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      firstReducer (state, title) {
        return {title}
      },
      secondReducer () {
        return {title: 123}
      },
    },
  })
  const firstReducerReturn = app.actions.firstReducer('bar')
  t.equal(firstReducerReturn.title, 'bar', 'first reducer returned correctly')
  const secondReducerReturn = app.actions.secondReducer()
  t.equal(typeof secondReducerReturn.title, 'number', 'second reducer returned correctly')
})
test('twine / reducers / update state', function (t) {
  t.plan(12)
  let state
  const app = twine((_state) => state = _state)({
    state: {
      title: 'not set',
      foo: 'untouched',
    },
    reducers: {
      firstReducer (state, title) {
        return {title}
      },
    },
    models: {
      nested: {
        state: {
          title: 'not set',
        },
        reducers: {
          secondReducer (state, title) {
            return {
              title,
            }
          },
        },
      },
    },
  })
  app.actions.firstReducer('bar')
  t.equal(state.title, 'bar', 'title updated for the first time')
  t.equal(state.foo, 'untouched', 'foo left untouched')
  t.equal(state.nested.title, 'not set', 'nested state left untouched')
  app.actions.firstReducer('baz')
  t.equal(state.title, 'baz', 'title updated for the second time')
  t.equal(state.foo, 'untouched', 'foo left untouched')
  t.equal(state.nested.title, 'not set', 'nested state left untouched')
  app.actions.nested.secondReducer('update me')
  t.equal(state.title, 'baz', 'title left untouched')
  t.equal(state.foo, 'untouched', 'foo left untouched')
  t.equal(state.nested.title, 'update me', 'nested state updated')
  app.actions.nested.secondReducer('update meeeeee')
  t.equal(state.title, 'baz', 'title left untouched')
  t.equal(state.foo, 'untouched', 'foo left untouched')
  t.equal(state.nested.title, 'update meeeeee', 'nested state updated')
})

// Subscription
test('twine / subscription / called on state changes', function (t) {
  t.plan(1)
  const app = twine(() => t.pass('subscription called'))({
    state: {},
    reducers: {
      myReducer () {
        return {
          success: 'subscription called',
        }
      },
    },
  })
  app.actions.myReducer()
})
test('twine / subscription / receives new and old state', function (t) {
  t.plan(2)
  const checkState = function (newState, oldState) {
    t.equal(oldState.title, 'not set', 'received previous state')
    t.equal(newState.title, 'set', 'received new state')
  }
  const app = twine(checkState)({
    state: {
      title: 'not set',
    },
    reducers: {
      myReducer () {
        return {
          title: 'set',
        }
      },
    },
  })
  app.actions.myReducer()
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
  app.actions.setTitle('set')
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
  app.actions.setTitle()
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
  app.actions.updateTitle('updated title')
  app.actions.checkLatestState()
})
test('twine / effects / unscoped effects receive global state', function (t) {
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
    models: {
      unscopedModel: {
        state: {},
        effects: {
          checkLatestState (state) {
            t.equal(state.title, 'updated title', 'effect received global state')
          },
        },
      },
    },
  })
  app.actions.updateTitle('updated title')
  app.actions.unscopedModel.checkLatestState()
})
test('twine / effects / unscoped effects receive global actions', function (t) {
  t.plan(2)
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
    models: {
      unscopedModel: {
        state: {},
        effects: {
          checkLatestState (state, actions) {
            t.equal(typeof actions.updateTitle, 'function', 'effect received global action')
            t.equal(typeof actions.unscopedModel.checkLatestState, 'function', 'effect received nested global action')
          },
        },
      },
    },
  })
  app.actions.unscopedModel.checkLatestState()
})
test('twine / effects / receive other actions', function (t) {
  t.plan(2)
  const app = twine()({
    state: {},
    reducers: {
      foo: noop,
    },
    effects: {
      myOtherEffect: noop,
      setTitle (state, actions) {
        t.equal(typeof actions.foo, 'function', 'effect received other reducer method')
        t.equal(typeof actions.myOtherEffect, 'function', 'effect received other effect method')
      },
    },
  })
  app.actions.setTitle()
})
test('twine / effects / receive multiple arguments', function (t) {
  t.plan(3)
  const app = twine()({
    state: {},
    effects: {
      foo (state, actions, foo, bar, baz) {
        t.equal(foo, 'foo', 'effect received first argument')
        t.equal(bar, 'bar', 'effect received second argument')
        t.equal(baz, 'baz', 'effect received third argument')
      },
    },
  })
  app.actions.foo('foo', 'bar', 'baz')
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
  t.equal(typeof app.actions.foo(), 'number', 'effect returned from invocation')
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
  app.actions.foo()
    .then(() => app.actions.bar())
})
test('twine / effects / can be chained when using callbacks', function (t) {
  t.plan(1)
  const app = twine()({
    state: {},
    effects: {
      foo (state, actions, foo, done) {
        done(foo)
        return foo
      },
      bar () {
        t.pass('the second effect was called after the first effects callback was called')
      },
    },
  })
  app.actions.foo('foo', () => {
    app.actions.bar()
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
test('twine / composition / composition works with actions', function (t) {
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
  t.equal(typeof app.actions.foo, 'function', 'parent actions are okay')
  if (app.actions.bar) {
    t.equal(typeof app.actions.bar.baz, 'function', 'child actions are okay')
  } else {
    t.fail('child method has not been merged')
  }
})
test('twine / composition / reducers receive state', function (t) {
  t.plan(2)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    reducers: {
      foo (state) {
        t.equal(state.foo, 'foo', 'parent reducer received state')
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
            t.equal(state.baz, 'baz', 'child reducer received state')
            return state
          },
        },
      },
    },
  })
  app.actions.foo()
  app.actions.bar.baz()
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
  app.actions.foo()
  app.actions.bar.baz()
})
test('twine / composition / effects receive child actions', function (t) {
  t.plan(8)
  const app = twine()({
    state: {
      foo: 'foo',
    },
    reducers: {
      qaz: noop,
    },
    effects: {
      foo (state, actions) {
        t.equal(typeof actions.foo, 'function', 'parent effect can call parent effect')
        t.equal(typeof actions.qaz, 'function', 'parent effect can call parent reducer')
        t.equal(typeof actions.bar.baz, 'function', 'parent effect can call child effect')
        t.equal(typeof actions.bar.quuz, 'function', 'parent effect can call child reducer')
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
          baz (state, actions) {
            t.equal(typeof actions.foo, 'function', 'child effect can call parent effect')
            t.equal(typeof actions.qaz, 'function', 'child effect can call parent reducer')
            t.equal(typeof actions.bar.baz, 'function', 'child effect can call child effect')
            t.equal(typeof actions.bar.quuz, 'function', 'child effect can call child reducer')
          },
        },
      },
    },
  })
  app.actions.foo()
  app.actions.bar.baz()
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
  app.actions.counter.increment()
  app.actions.counter.anotherModel.update()
})
test('twine / scoped / effects receive local state and actions', function (t) {
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
          increment (localState, localActions) {
            t.equal(localState.count, 1, 'first level effect received local state')
            t.equal(typeof localActions.foo, 'function', 'first level effect received local actions')
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
              update (localState, localActions) {
                t.equal(localState.myState, 'hey', 'second level effect received local state')
                t.equal(typeof localActions.bar, 'function', 'second level effect received local actions')
              },
            },
          },
        },
      },
    },
  })
  app.actions.counter.increment()
  app.actions.counter.anotherModel.update()
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
  appOne.actions.counter.anotherModel.update()


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
  appTwo.actions.counter.increment()
})
test('twine / scoped / effects receive latest local state', function (t) {
  t.plan(1)
  const app = twine()({
    state: {},
    models: {
      scopedModel: {
        scoped: true,
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
            t.equal(state.title, 'updated title', 'effect received local state')
          },
        },
      },
    },
  })
  app.actions.scopedModel.updateTitle('updated title')
  app.actions.scopedModel.checkLatestState()
})
test.skip('skip / twine / scoped / effects receive local actions that update global state', function (t) {})
test.skip('skip / twine / scoped / hooks still work as expected with global state', function (t) {})

test('twine / utils / gets nested state given array of keys', function (t) {
  t.plan(3)
  let state = {
    foo: 'foo',
    bar: {
      bar: 'bar',
      baz: {
        baz: 'baz',
      },
    },
  }
  let firstLevel = getNestedObjFromPath(state, ['foo'])
  let secondLevel = getNestedObjFromPath(state, ['bar'])
  let thirdLevel = getNestedObjFromPath(state, ['bar', 'baz'])
  t.equal(firstLevel, 'foo')
  t.equal(secondLevel, state.bar)
  t.equal(thirdLevel, state.bar.baz)
})
