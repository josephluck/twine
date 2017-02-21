Another state management lib

Single model useage:

```javascript
  const tansu = require('tansu')
  const store = tansu({
    state: {
      title: 'foo'
    },
    reducers: {
      update (state, title) {
        return {
          ...state,
          title: title
        }
      }
    },
    effects: {
      updateAsync (state, methods, title, timeout) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(methods.update(title))
          }, timeout)
        })
      }
    }
  })

  store.subscribe(function (state) {
    console.log('the state updated: ' + state.title)
  })

  console.log('the initial title is: ' + store.state.title) // logs 'the initial state is: foo'
  store.methods.update('bar') // logs 'the state updated: bar'
  store.methods.updateAsync('baz', 1000) // logs 'the state updated: baz' after 1 second
```

Composing models together

```javascript
  const tansu = require('tansu')
  const store = tansu({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo: function () {}
    },
    models: {
      myOtherModel: {
        state: {
          bar: 'bar'
        },
        reducers: {
          bar: function () {}
        }
      }
    }
  })
  console.log(store.state.foo) // logs 'foo'
  console.log(store.state.foo.myOtherModel.bar) // logs 'bar'
  store.methods.foo() // calls parent model reducer
  store.methods.myOtherModel.bar() // calls child model reducer
```
