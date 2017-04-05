import * as test from 'tape'
import twine from '../src/index'

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
      },
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

test.skip('skip / twine / scoped / hooks still work as expected with global state', function (t) {})
