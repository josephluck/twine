import twine from '../../src'
import html from 'yo-yo'

function subscribe (_state, _prev, _actions) {
  console.log(_state, _actions)
  state = _state
  actions = _actions
  render()
}

let {state, actions} = twine(subscribe)({
  state: {
    title: 'foo',
  },
  reducers: {
    updateTitle (state, title) {
      return {title}
    },
  },
})

function view () {
  return html`
    <div>
      ${state.title}
      <input value=${state.title} oninput=${e => actions.updateTitle(e.target.value)} />
    </div>
  `
}

const mount = document.createElement('div')
document.body.appendChild(mount)

function render () {
  html.update(mount, view())
}

render()
