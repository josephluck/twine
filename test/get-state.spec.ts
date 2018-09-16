import * as test from 'tape'
import twine from '../src/index'

test('twine / getState', t => {
  t.plan(4)
  const app = twine<{ title: string }, any>({
    state: {
      title: 'not set',
    },
    reducers: {
      setTitle(state, title) {
        return { title }
      },
    },
  })
  t.equal(app.state.title, 'not set')
  t.equal(app.getState().title, 'not set')
  app.actions.setTitle('new title')
  t.equal(app.state.title, 'not set')
  t.equal(app.getState().title, 'new title')
})
