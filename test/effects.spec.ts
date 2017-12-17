import * as test from 'tape'
import twine from '../src/index'
const noop = () => null

test('twine / effects / receive state', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {
      title: 'not set',
    },
    effects: {
      setTitle(state) {
        t.equal(state.title, 'not set', 'reducer received state')
      },
    },
  })
  app.actions.setTitle()
})
test('twine / effects / receive latest state', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle(state, { title }) {
        return {
          title: title,
        }
      },
    },
    effects: {
      checkLatestState(state) {
        t.equal(state.title, 'updated title', 'reducer received state')
      },
    },
  })
  app.actions.updateTitle({ title: 'updated title' })
  app.actions.checkLatestState()
})
test('twine / effects / unscoped effects receive global state', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle(state, { title }) {
        return {
          title: title,
        }
      },
    },
    models: {
      unscopedModel: {
        state: {},
        effects: {
          checkLatestState(state) {
            t.equal(state.title, 'updated title', 'effect received global state')
          },
        },
      },
    },
  })
  app.actions.updateTitle({ title: 'updated title' })
  app.actions.unscopedModel.checkLatestState()
})
test('twine / effects / unscoped effects receive global actions', t => {
  t.plan(2)
  const app = twine<any, any>({
    state: {
      title: 'not set',
    },
    reducers: {
      updateTitle(state, { title }) {
        return {
          title: title,
        }
      },
    },
    models: {
      unscopedModel: {
        state: {},
        effects: {
          checkLatestState(state, actions) {
            t.equal(typeof actions.updateTitle, 'function', 'effect received global action')
            t.equal(
              typeof actions.unscopedModel.checkLatestState,
              'function',
              'effect received nested global action',
            )
          },
        },
      },
    },
  })
  app.actions.unscopedModel.checkLatestState()
})
test('twine / effects / receive other actions', t => {
  t.plan(2)
  const app = twine<any, any>({
    state: {},
    reducers: {
      foo: noop,
    },
    effects: {
      myOtherEffect: noop,
      setTitle(state, actions) {
        t.equal(typeof actions.foo, 'function', 'effect received other reducer method')
        t.equal(typeof actions.myOtherEffect, 'function', 'effect received other effect method')
      },
    },
  })
  app.actions.setTitle()
})
test('twine / effects / receive multiple arguments', t => {
  t.plan(3)
  const app = twine<any, any>({
    state: {},
    effects: {
      foo(state, actions, { foo, bar, baz }) {
        t.equal(foo, 'foo', 'effect received first argument')
        t.equal(bar, 'bar', 'effect received second argument')
        t.equal(baz, 'baz', 'effect received third argument')
      },
    },
  })
  app.actions.foo({ foo: 'foo', bar: 'bar', baz: 'baz' })
})
test('twine / effects / return from invocation', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {},
    effects: {
      foo() {
        return 123
      },
    },
  })
  t.equal(typeof app.actions.foo(), 'number', 'effect returned from invocation')
})
test('twine / effects / can be chained when using promises', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {},
    effects: {
      foo() {
        return Promise.resolve()
      },
      bar() {
        t.pass('the second effect was called after the first effects returned promise resolved')
      },
    },
  })
  app.actions.foo().then(() => app.actions.bar())
})
test('twine / effects / can be chained when using callbacks', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {},
    effects: {
      foo(state, actions, { foo, done }) {
        done(foo)
        return foo
      },
      bar() {
        t.pass('the second effect was called after the first effects callback was called')
      },
    },
  })
  app.actions.foo({
    foo: 'foo',
    done: () => {
      app.actions.bar()
    },
  })
})
test('twine / scoped / effects receive local state and actions', t => {
  t.plan(4)
  const app = twine<any, any>({
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
          foo() { },
        },
        effects: {
          increment(state, actions) {
            t.equal(state.count, 1, 'first level effect received local state')
            t.equal(typeof actions.foo, 'function', 'first level effect received local actions')
          },
        },
        models: {
          anotherModel: {
            scoped: true,
            state: {
              myState: 'hey',
            },
            reducers: {
              bar() { },
            },
            effects: {
              update(state, actions) {
                t.equal(state.myState, 'hey', 'second level effect received local state')
                t.equal(
                  typeof actions.bar,
                  'function',
                  'second level effect received local actions',
                )
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
test('twine / scoped / effects receive latest local state', t => {
  t.plan(1)
  const app = twine<any, any>({
    state: {},
    models: {
      scopedModel: {
        scoped: true,
        state: {
          title: 'not set',
        },
        reducers: {
          updateTitle(state, { title }) {
            return {
              title: title,
            }
          },
        },
        effects: {
          checkLatestState(state) {
            t.equal(state.title, 'updated title', 'effect received local state')
          },
        },
      },
    },
  })
  app.actions.scopedModel.updateTitle({ title: 'updated title' })
  app.actions.scopedModel.checkLatestState()
})
test.skip('skip / twine / scoped / effects receive local actions that update global state', function (
  t,
) { })
