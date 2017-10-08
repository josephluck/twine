import * as test from 'tape'
import twine from '../src/index'

test('twine / reducers / receive state', function (t) {
  t.plan(1)
  const app = twine({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle(state) {
        t.equal(state.title, 'not set', 'reducer received state')
      },
    },
  })
  app.actions.setTitle()
})
test('twine / reducers / receive latest state', function (t) {
  t.plan(2)
  const app = twine({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle(state, title) {
        return {
          title,
        }
      },
      checkLatestState(state) {
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
          updateFoo(state, foo) {
            return {
              foo,
            }
          },
          checkLatestState(state) {
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
  const app = twine({
    state: {},
    reducers: {
      setTitle(state, title, other) {
        t.equal(title, 'foo', 'first argument is okay')
        t.equal(other, 123, 'second argument is okay')
      },
    },
  })
  app.actions.setTitle('foo', 123)
})
test('twine / reducers / return from invocation', function (t) {
  t.plan(2)
  const app = twine({
    state: {},
    reducers: {
      firstReducer(state, title) {
        return { title }
      },
      secondReducer() {
        return { title: 123 }
      },
    },
  })
  const firstReducerReturn = app.actions.firstReducer('bar')
  t.equal(firstReducerReturn.title, 'bar', 'first reducer returned correctly')
  const secondReducerReturn = app.actions.secondReducer()
  t.equal(typeof secondReducerReturn.title, 'number', 'second reducer returned correctly')
})
test('twine / reducers / return global state', function (t) {
  t.plan(17)
  let state
  const app = twine({
    state: {
      title: 'not set',
      foo: 'untouched',
    },
    reducers: {
      firstReducer(state, title) {
        return { title }
      },
    },
    models: {
      nested: {
        state: {
          title: 'not set',
        },
        reducers: {
          secondReducer(state, title) {
            return {
              title,
            }
          },
        },
        models: {
          nestedAgain: {
            scoped: true,
            state: {
              title: 'nested again',
            },
            reducers: {
              thirdReducer (state, title) {
                return {
                  title,
                }
              },
            },
          },
        },
      },
    },
  }, (_state) => state = _state)
  const reducer1 = app.actions.firstReducer('bar')
  t.equal(reducer1.title, 'bar', 'state is correct after first reducer')
  t.equal(reducer1.foo, 'untouched', 'state is correct after first reducer')
  t.equal(reducer1.nested.title, 'not set', 'state is correct after first reducer')
  t.equal(reducer1.nested.nestedAgain.title, 'nested again', 'scoped models state is correct after first reducer')
  const reducer2 = app.actions.firstReducer('baz')
  t.equal(reducer2.title, 'baz', 'state is correct after second reducer')
  t.equal(reducer2.foo, 'untouched', 'state is correct after second reducer')
  t.equal(reducer2.nested.title, 'not set', 'state is correct after second reducer')
  t.equal(reducer2.nested.nestedAgain.title, 'nested again', 'scoped models state is correct after second reducer')
  const reducer3 = app.actions.nested.secondReducer('update me')
  t.equal(reducer3.title, 'baz', 'state is correct after third reducer')
  t.equal(reducer3.foo, 'untouched', 'state is correct after third reducer')
  t.equal(reducer3.nested.title, 'update me', 'state is correct after third reducer')
  t.equal(reducer3.nested.nestedAgain.title, 'nested again', 'scoped models state is correct after third reducer')
  const reducer4 = app.actions.nested.secondReducer('update meeeeee')
  t.equal(reducer4.title, 'baz', 'state is correct after fourth reducer')
  t.equal(reducer4.foo, 'untouched', 'state is correct after fourth reducer')
  t.equal(reducer4.nested.title, 'update meeeeee', 'state is correct after fourth reducer')
  t.equal(reducer4.nested.nestedAgain.title, 'nested again', 'scoped models state is correct after fourth reducer')
  const reducer5 = app.actions.nested.nestedAgain.thirdReducer('updated')
  t.equal(reducer5.title, 'updated', 'state is correct after fourth (scoped) reducer')
})
test('twine / reducers / update state', function (t) {
  t.plan(12)
  let state
  const app = twine({
    state: {
      title: 'not set',
      foo: 'untouched',
    },
    reducers: {
      firstReducer (state, title) {
        return { title }
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
  }, (_state) => state = _state)
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
test('twine / scoped / reducers update local state effecting global state', function (t) {
  t.plan(8)
  function subscribeOne (state) {
    t.equal(state.title, 'not set', 'title remains unchanged')
    t.equal(state.counter.count, 1, 'count remains unchanged')
    t.equal(state.foo.bar, 'baz', 'foo bar remains unchanged')
    t.equal(state.counter.anotherModel.myState, 'updated', 'state updated')
  }
  const appOne = twine({
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
  }, subscribeOne)
  appOne.actions.counter.anotherModel.update()

  function subscribeTwo (state) {
    t.equal(state.title, 'not set', 'title remains unchanged')
    t.equal(state.counter.count, 2, 'count updated')
    t.equal(state.foo.bar, 'baz', 'foo bar remains unchanged')
    t.equal(state.counter.anotherModel.myState, 'hey', 'state remains unchanged')
  }
  const appTwo = twine({
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
          increment (state) {
            return {
              count: state.count + 1,
            }
          },
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
            },
            reducers: {},
          },
        },
      },
      foo: {
        state: {
          bar: 'baz',
        },
      },
    },
  }, subscribeTwo)
  appTwo.actions.counter.increment()
})
test('twine / scoped / reducers receive local state', function (t) {
  t.plan(2)
  const app = twine({
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
test('twine / scoped / reducers return local state', function (t) {
  t.plan(3)
  const app = twine({
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
            return { count: localState.count + 1 }
          },
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
              myUnchangedState: 123,
            },
            reducers: {
              update (localState) {
                return { myState: 'updated' }
              },
            },
          },
        },
      },
    },
  })
  const reducer1 = app.actions.counter.increment()
  t.equal(reducer1.count, 2, 'first reducer returned local state')
  const reducer2 = app.actions.counter.anotherModel.update()
  t.equal(reducer2.myState, 'updated', 'second reducer returned local state')
  t.equal(reducer2.myUnchangedState, 123, 'second reducer returned local state including unchanged state')
})
