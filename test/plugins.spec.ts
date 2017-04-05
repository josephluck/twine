import * as test from 'tape'
import twine from '../src/index'

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
