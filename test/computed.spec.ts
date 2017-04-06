import * as test from 'tape'
import twine from '../src/index'

test.skip('twine / computed / computed state called on instantiation', function (t) {
  t.plan(2)
  let state
  twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed () {
      return {
        foo: 'foo',
      }
    },
  })
  t.equal(state.title, 'not set', 'title is correct on instantiation from state object')
  t.equal(state.foo, 'foo', 'foo is correct on instantiation from computed function')
})

test.skip('twine / computed / computed state receives state', function (t) {
  t.plan(2)
  let state
  twine((_state) => state = _state)({
    state: {
      title: 'not set',
    },
    computed (localState) {
      t.equal(localState.title, 'not set', 'computed state received title')
      t.equal(localState.foo, undefined, 'computed state does not receive computed state')
      return {
        foo: 'foo',
      }
    },
  })
})

test.skip('twine / computed / computed state effects global state', function (t) {
  t.plan(2)
  let state
  twine((_state) => state = _state)({
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

test.skip('twine / computed / computed state called on state updates', function (t) {
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
