import twine from '../../src'
import log from '../../src/log'
import Twine from '../../src/types'
import html from 'yo-yo'

interface State {
  title: string
}
interface Reducers {
  updateTitle: Twine.Reducer<State, { title: string }>
}
interface Effects {
  reset: Twine.Effect0<State, Actions>
}
type Actions = Twine.Actions<Reducers, Effects>

const model: Twine.ModelImpl<State, Reducers, Effects> = {
  state: {
    title: 'foo',
  },
  reducers: {
    updateTitle(state, { title }) {
      return { title }
    },
  },
  effects: {
    reset(state, actions) {
      setTimeout(() => {
        actions.updateTitle({ title: ' ' })
      }, 100)
    },
  },
}

const view = (state: State, actions: Actions) => html`
  <div>
    ${state.title}
    <input
      value=${state.title}
      oninput=${(e: any) => actions.updateTitle({ title: e.target.value })}
    />
    <button onclick=${() => actions.reset()}>Reset</button>
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
