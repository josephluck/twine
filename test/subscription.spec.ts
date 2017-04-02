import * as test from 'tape'
import twine from '../src/index'

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
