import * as test from 'tape'
import twine from '../src/index'

// Hooks
test('twine / plugins / accepts an object containing plugins', function (t) {
  t.plan(12)
  const plugins = {
    onReducerCalled (state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
      t.equal(prev.title, 'not set', 'onReducerCalled plugin received correct prev state')
      t.equal(state.title, 'set', 'onReducerCalled plugin received correct new state')
      t.equal(args[0], 'set', 'onReducerCalled plugin received correct arguments')
      t.equal(name, 'setTitle', 'onReducerCalled plugin received correct reducer name')
    },
    onEffectCalled (state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
      t.equal(state.title, 'set', 'onEffectCalled plugin received correct state')
      t.equal(args[0], 'set again', 'onEffectCalled plugin received correct arguments')
      t.equal(name, 'setTitleAsync', 'onEffectCalled plugin received correct effect name')
    },
    onStateChange (state, prev) {
      t.pass('plugin called on state change')
      t.equal(prev.title, 'not set', 'onStateChange plugin received correct prev state')
      t.equal(state.title, 'set', 'onStateChange plugin received correct new state')
    },
  }
  const app = twine(plugins)({
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
    effects: {
      setTitleAsync (state, actions, title) {
        return null
      },
    },
  })
  app.actions.setTitle('set')
  app.actions.setTitleAsync('set again')
})
