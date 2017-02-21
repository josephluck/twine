// Example store with model definition
const model = {
  state: {
    title: 'My title'
  },
  reducers: {
    updateMyTitle (localState, title, uppercase) {
      return {
        ...localState,
        title: uppercase ? title.toUpperCase() : title,
      }
    }
  },
  effects: {
    updateMyTitleAsync (globalState, globalMethods, title) {
      return globalMethods.someOtherModel.doSomethingElse()
        .then(returnFromDoSomethingElse => {
          return globalMethods.updateMyTitle(title)
        })
    }
  },
  models: {
    someOtherModel: {
      state: {},
      reducers: {},
      effects: {
        doSomethingElse () {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve('hey')
            }, 5000)
          })
        }
      }
    }
  ]
}
const store = AwesomeStateManagementLib(model)
console.log(store.state)
store.subscribe(state => console.log('Hey the store updated', state))
store.methods.someOtherModel.doSomethingElse().then(store.methods.updateMyTitleAsync)

// Example useage with the DOM (in a closure!)
let dom = render(store.state, store.methods)
function applyStateToDom (state) {
  newDom = render(state, store.methods)
  _dom = morph(dom, newDom)
  dom = _dom
}
store.subscribe(applyStateToDom)

// API for the framework
function AwesomeFramework (model) {
  const store = AwesomeStateManagementLib(model)
  return function () {
    let dom = render(store.state, store.methods)
    function applyStateToDom (state) {
      newDom = render(state, store.methods)
      _dom = morph(dom, newDom)
      dom = _dom
    }
    store.subscribe(applyStateToDom)
    return dom
  }
}
const app = AwesomeFramework(model)
document.body.appendChild(app())