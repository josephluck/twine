import twine from '../../src'
import log from '../../src/log'
import html from 'yo-yo'

function subscribe (_state, _prev, _actions) {
  state = _state
  actions = _actions
  render()
}

const plugins = [
  subscribe,
  log,
]

let {state, actions} = twine(plugins)({
  state: {
    title: 'foo',
  },
  reducers: {
    updateTitle (state, title, abc) {
      return {title}
    },
  },
  effects: {
    updateAsync (state, actions, title, abc) {
      return actions.updateTitle(title, abc)
    },
  },
})

function view () {
  return html`
    <div>
      ${state.title}
      <input value=${state.title} oninput=${e => actions.updateTitle(e.target.value, Math.random())} />
      <input value=${state.title} oninput=${e => actions.updateAsync(e.target.value, Math.random())} />
    </div>
  `
}

const mount = document.createElement('div')
document.body.appendChild(mount)

function render () {
  html.update(mount, view())
}

render()
