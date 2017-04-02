import * as test from 'tape'
import {updateStateAtPath, getNestedObjFromPath} from '../src/index'

test('twine / utils / gets nested state given array of keys', function (t) {
  t.plan(1)
  let state = {
    foo: 'foo',
    bar: {
      bar: 'bar',
      baz: {
        baz: 'baz',
      },
    },
  }
  let newBazState = {
    baz: 'baz updated',
  }
  let newState = updateStateAtPath(state, ['bar', 'baz'], newBazState)
  t.equal(newState.bar.baz, newBazState)
})

test('twine / utils / gets nested state given array of keys', function (t) {
  t.plan(3)
  let state = {
    foo: 'foo',
    bar: {
      bar: 'bar',
      baz: {
        baz: 'baz',
      },
    },
  }
  let firstLevel = getNestedObjFromPath(state, ['foo'])
  let secondLevel = getNestedObjFromPath(state, ['bar'])
  let thirdLevel = getNestedObjFromPath(state, ['bar', 'baz'])
  t.equal(firstLevel, 'foo')
  t.equal(secondLevel, state.bar)
  t.equal(thirdLevel, state.bar.baz)
})
