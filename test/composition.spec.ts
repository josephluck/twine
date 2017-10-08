import * as test from 'tape'
import twine from '../src/index'
const noop = () => null

test('twine / composition / composition merges state together', function (t) {
  t.plan(2)
  const app = twine({
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
  const app = twine({
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
  const app = twine({
    state: {
      foo: 'foo',
    },
    reducers: {
      foo ({state}) {
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
          baz ({state}) {
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
  const app = twine({
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
  const app = twine({
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
