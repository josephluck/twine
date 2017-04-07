import * as test from 'tape'
import twine from '../src/index'

test('twine / computed / computed state called on instantiation', function (t) {
  t.plan(3)
  let {state} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed () {
      t.pass('computed state called on instantiation')
      return {
        foo: 'foo',
      }
    },
  })
  t.equal(state.title, 'not set', 'title is correct on instantiation from state object')
  t.equal(state.foo, 'foo', 'foo is correct on instantiation from computed function')
})

test('twine / computed / computed state in nested models are called on instantiation', function (t) {
  t.plan(6)
  let {state} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed () {
      t.pass('computed state called on instantiation')
      return {
        foo: 'foo',
      }
    },
    models: {
      anotherModel: {
        state: {
          abc: 123,
        },
        computed () {
          t.pass('nested models computed state called on instantiation')
          return {
            bar: 'bar',
          }
        },
      },
    },
  })
  t.equal(state.title, 'not set', 'title is correct on instantiation from state object')
  t.equal(state.foo, 'foo', 'foo is correct on instantiation from computed function')
  t.equal(state.anotherModel.abc, 123, 'nested model state is correct from state object')
  t.equal(state.anotherModel.bar, 'bar', 'nested model computed state is correct on instantiation')
})

test('twine / computed / computed state receives state', function (t) {
  t.plan(1)
  let state
  twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (localState) {
      t.equal(localState.title, 'not set', 'computed state received title')
      return {
        foo: 'foo',
      }
    },
  })
})

test('twine / computed / computed state receives state with nested models state', function (t) {
  t.plan(2)
  let state
  twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (localState) {
      console.log(localState)
      t.equal(localState.title, 'not set', 'computed state received title')
      t.equal(localState.anotherModel.bar, '123', 'computed state receives nested models state')
      return {
        foo: 'foo',
      }
    },
    models: {
      anotherModel: {
        state: {
          bar: '123',
        },
        computed (localState) {
          return {
            abc: 123,
          }
        },
      },
    },
  })
})

test('twine / computed / computed state effects global state', function (t) {
  t.plan(2)
  let {state} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed () {
      return {
        foo: 'foo',
      }
    },
  })
  t.equal(state.title, 'not set', 'local state is correct')
  t.equal(state.foo, 'foo', 'computed state is correct')
})

test('twine / computed / computed state called on state updates', function (t) {
  t.plan(2)
  let state
  const app = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (state) {
      t.pass('computed state called on state updates')
      return {
        foo: 'foo',
      }
    },
    reducers: {
      update (state) {
        return {
          title: 'set',
        }
      },
    },
  })
  app.actions.update()
})

test('twine / computed / computed state receives child models state on state updates', function (t) {
  t.plan(7)
  let {state, actions} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (localState) {
      t.pass('computed state called on state update')
      t.equal(localState.title, 'not set', 'computed state recieved correct local state in top level model')
      return {
        foo: 'foo',
      }
    },
    reducers: {
      update (state) {
        return {
          title: state.title,
        }
      },
    },
    models: {
      anotherModel: {
        state: {
          abc: 123,
        },
        computed (localState) {
          t.pass('child computed state called')
          t.equal(localState.abc, 123, 'computed state recieved correct local state in child model')
          return {
            def: localState.abc * 2,
          }
        },
      },
    },
  })
  t.equal(state.anotherModel.def, 246, 'computed state in child model is correct')
  actions.update()
})

test('twine / computed / reducers receive state including computed state', function (t) {
  t.plan(4)
  let {state, actions} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (state) {
      t.pass('computed state called on state updates')
      return {
        foo: 'foo',
      }
    },
    reducers: {
      update (state) {
        t.equal(state.title, 'not set', 'reducer received computed state')
        t.equal(state.foo, 'foo', 'reducer received computed state')
        return {
          title: 'set',
        }
      },
    },
  })
  actions.update()
})

test('twine / computed / effects receive state including computed state', function (t) {
  t.plan(2)
  let {state, actions} = twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (state) {
      return {
        foo: 'foo',
      }
    },
    effects: {
      update (state) {
        t.equal(state.title, 'not set', 'reducer received computed state')
        t.equal(state.foo, 'foo', 'reducer received computed state')
      },
    },
  })
  actions.update()
})
