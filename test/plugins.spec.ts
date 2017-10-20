import * as test from 'tape'
import twine from '../src/index'
import Twine from '../src/types'

test('twine / plugins / accepts a single function plugin', t => {
  t.plan(1)
  const plugins = (state, prev) => {
    t.pass('plugin called on state change')
  }
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
})

test('twine / plugins / accepts a plugin object', t => {
  t.plan(3)
  const plugins = {
    onReducerCalled(state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
    },
    onEffectCalled(state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
    },
    onStateChange(state, prev) {
      t.pass('plugin called on state change')
    },
  }
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
      effects: {
        setTitleAsync(state, actions, { title }) {
          return null
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
  app.actions.setTitleAsync({ title: 'set again' })
})

test('twine / plugins / accepts an array of plugin objects', t => {
  t.plan(6)
  const plugins = {
    onReducerCalled(state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
    },
    onEffectCalled(state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
    },
    onStateChange(state, prev) {
      t.pass('plugin called on state change')
    },
  }
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
      effects: {
        setTitleAsync(state, actions, { title }) {
          return null
        },
      },
    },
    [plugins, plugins],
  )
  app.actions.setTitle({ title: 'set' })
  app.actions.setTitleAsync({ title: 'set again' })
})

test('twine / plugins / onReducerCalled plugin', t => {
  t.plan(5)
  const plugins = {
    onReducerCalled(state, prev, name, args) {
      t.pass('onReducerCalled called on reducer call')
      t.equal(prev.title, 'not set', 'onReducerCalled plugin received correct prev state')
      t.equal(state.title, 'set', 'onReducerCalled plugin received correct new state')
      t.equal(args.title, 'set', 'onReducerCalled plugin received correct arguments')
      t.equal(name, 'setTitle', 'onReducerCalled plugin received correct reducer name')
    },
  }
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
      effects: {
        setTitleAsync(state, actions, { title }) {
          return null
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
  app.actions.setTitleAsync({ title: 'set again' })
})

test('twine / plugins / onEffectCalled plugin', t => {
  t.plan(4)
  const plugins = {
    onEffectCalled(state, name, params) {
      t.pass('onEffectCalled called on effect call')
      t.equal(state.title, 'set', 'onEffectCalled plugin received correct state')
      t.equal(params.title, 'set again', 'onEffectCalled plugin received correct arguments')
      t.equal(name, 'setTitleAsync', 'onEffectCalled plugin received correct effect name')
    },
  } as Twine.Plugin
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
      effects: {
        setTitleAsync(state, actions, { title }) {
          return null
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
  app.actions.setTitleAsync({ title: 'set again' })
})

test('twine / plugins / onStateChange plugin', t => {
  t.plan(3)
  const plugins = {
    onStateChange(state, prev) {
      t.pass('plugin called on state change')
      t.equal(prev.title, 'not set', 'onStateChange plugin received correct prev state')
      t.equal(state.title, 'set', 'onStateChange plugin received correct new state')
    },
  } as Twine.Plugin
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title }) {
          return {
            title,
          }
        },
      },
      effects: {
        setTitleAsync(state, actions, { title }) {
          return null
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
  app.actions.setTitleAsync({ title: 'set again' })
})

test('twine / plugins / wrapReducers plugin', t => {
  t.plan(5)
  const plugins = {
    wrapReducers(reducer) {
      t.pass('wrap reducers called with reducer')
      return function (params) {
        t.pass('wrapped reducer called')
        return reducer(Object.assign({ abc: 123 }, params, {}))
      }
    },
  } as Twine.Plugin
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle(state, { title, abc }) {
          t.pass('wrapped reducer calls original reducer')
          t.equal(title, 'set', 'original reducer received correct input argument')
          t.equal(abc, 123, 'original reducer received additional argument from plugin')
          return {
            title,
          }
        },
      },
    },
    plugins,
  )
  app.actions.setTitle({ title: 'set' })
})

test('twine / plugins / wrapEffects plugin', t => {
  t.plan(4)
  const plugins = {
    wrapEffects(effect) {
      return function (params) {
        t.pass('wrapped effect called')
        return effect(Object.assign({ abc: 123 }, params, {}))
      }
    },
  } as Twine.Plugin
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      effects: {
        setTitleAsync(state, actions, { title, abc }) {
          t.pass('wrapped effect calls original effect')
          t.equal(title, 'set', 'original effect received correct input argument')
          t.equal(abc, 123, 'original effect received additional argument from plugin')
          return null
        },
      },
    },
    plugins,
  )
  app.actions.setTitleAsync({ title: 'set' })
})

test('twine / plugins / wrapped effects and reducers retain their function names', t => {
  t.plan(2)
  const plugins = {
    wrapReducers(reducer) {
      return function (params) {
        return reducer(params)
      }
    },
    wrapEffects(effect) {
      return function (params) {
        return effect(params)
      }
    },
  } as Twine.Plugin
  const app = twine<any, any>(
    {
      state: {
        title: 'not set',
      },
      reducers: {
        setTitle() {
          return { title: 'set' }
        },
      },
      effects: {
        setTitleAsync() {
          return null
        },
      },
    },
    plugins,
  )
  t.equal(app.actions.setTitle.name, 'setTitle', 'reducer retained its function name')
  t.equal(app.actions.setTitleAsync.name, 'setTitleAsync', 'effect retained its function name')
})
