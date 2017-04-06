import * as test from 'tape'
import twine from '../src/index'

test('twine / plugins / accepts a single function plugin', function (t) {
  t.plan(1)
  const plugins = (state, prev) => {
    t.pass('plugin called on state change')
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
  })
  app.actions.setTitle('set')
})

test('twine / plugins / accepts a plugin object', function (t) {
  t.plan(3)
  const plugins = {
    onReducerCalled (state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
    },
    onEffectCalled (state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
    },
    onStateChange (state, prev) {
      t.pass('plugin called on state change')
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

test('twine / plugins / accepts an array of plugin objects', function (t) {
  t.plan(6)
  const plugins = {
    onReducerCalled (state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
    },
    onEffectCalled (state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
    },
    onStateChange (state, prev) {
      t.pass('plugin called on state change')
    },
  }
  const app = twine([plugins, plugins])({
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

test('twine / plugins / onReducerCalled plugin', function (t) {
  t.plan(5)
  const plugins = {
    onReducerCalled (state, prev, name, ...args) {
      t.pass('onReducerCalled called on reducer call')
      t.equal(prev.title, 'not set', 'onReducerCalled plugin received correct prev state')
      t.equal(state.title, 'set', 'onReducerCalled plugin received correct new state')
      t.equal(args[0], 'set', 'onReducerCalled plugin received correct arguments')
      t.equal(name, 'setTitle', 'onReducerCalled plugin received correct reducer name')
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

test('twine / plugins / onEffectCalled plugin', function (t) {
  t.plan(4)
  const plugins = {
    onEffectCalled (state, name, ...args) {
      t.pass('onEffectCalled called on effect call')
      t.equal(state.title, 'set', 'onEffectCalled plugin received correct state')
      t.equal(args[0], 'set again', 'onEffectCalled plugin received correct arguments')
      t.equal(name, 'setTitleAsync', 'onEffectCalled plugin received correct effect name')
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

test('twine / plugins / onStateChange plugin', function (t) {
  t.plan(3)
  const plugins = {
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

test('twine / plugins / wrapReducers plugin', function (t) {
  t.plan(5)
  const plugins = {
    wrapReducers (reducer) {
      t.pass('wrap reducers called with reducer')
      return function () {
        t.pass('wrapped reducer called')
        return reducer.apply(null, Array.prototype.slice.call(arguments).concat(123))
      }
    },
  }
  const app = twine(plugins)({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle (state, title, abc) {
        t.pass('wrapped reducer calls original reducer')
        t.equal(title, 'set', 'original reducer received correct input argument')
        t.equal(abc, 123, 'original reducer received additional argument from plugin')
        return {
          title: title,
        }
      },
    },
  })
  app.actions.setTitle('set')
})

test('twine / plugins / wrapEffects plugin', function (t) {
  t.plan(4)
  const plugins = {
    wrapEffects (effect) {
      return function () {
        t.pass('wrapped effect called')
        return effect.apply(null, Array.prototype.slice.call(arguments).concat(123))
      }
    },
  }
  const app = twine(plugins)({
    state: {
      title: 'not set',
    },
    effects: {
      setTitleAsync (state, actions, title, abc) {
        t.pass('wrapped effect calls original effect')
        t.equal(title, 'set', 'original effect received correct input argument')
        t.equal(abc, 123, 'original effect received additional argument from plugin')
        return null
      },
    },
  })
  app.actions.setTitleAsync('set')
})

test('twine / plugins / wrapped effects and reducers retain their function names', function (t) {
  t.plan(2)
  const plugins = {
    wrapReducers (reducer) {
      return function () {
        return reducer.apply(null, Array.prototype.slice.call(arguments).concat(123))
      }
    },
    wrapEffects (effect) {
      return function () {
        return effect.apply(null, Array.prototype.slice.call(arguments).concat(123))
      }
    },
  }
  const app = twine(plugins)({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle () {
        return { title: 'set' }
      },
    },
    effects: {
      setTitleAsync () {
        return null
      },
    },
  })
  t.equal(app.actions.setTitle.name, 'setTitle', 'reducer retained its function name')
  t.equal(app.actions.setTitleAsync.name, 'setTitleAsync', 'effect retained its function name')
})
