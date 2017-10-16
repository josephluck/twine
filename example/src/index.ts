import twine from '../../src'
import log from '../../src/log'
import { Twine } from '../../src/types'
import html from 'yo-yo'

interface State {
  title: string
}
interface Reducers {
  updateTitle: Twine.Reducer<State, { title: string }>
}
interface Effects {
  updateAsync: Twine.Effect<State, Actions, { title: string }>
}
type Actions = Twine.Actions<Reducers, Effects>

const model: Twine.ModelImpl<State, Reducers, Effects> = {
  state: {
    title: 'foo',
  },
  reducers: {
    updateTitle({ title }) {
      return { title }
    },
  },
  effects: {
    updateAsync({ state, actions, title }) {
      setTimeout(() => {
        actions!.updateTitle({ title })
      })
    },
  },
}

const view = (state: State, actions: Actions) => html`
  <div>
    ${state.title}
    <input
      value=${state.title}
      oninput=${e => actions.updateTitle({ title: e.target.value })}
    />
    <input
      value=${state.title}
      oninput=${e => actions.updateAsync({ title: e.target.value })}
    />
  </div>
`

const subscribe: Twine.Subscriber<State, Actions> = (newState, oldState, newActions) => {
  render(newState, newActions)
}

const plugins = [subscribe, log]
const app = twine<State, Actions>(model, plugins)
const mount = document.createElement('div')
document.body.appendChild(mount)

const render = (state: State, actions: Actions) => {
  html.update(mount, view(state, actions))
}
render(app.state, app.actions)
