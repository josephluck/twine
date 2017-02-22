Another state management lib

Single model useage:

```javascript
  const tansu = require('tansu')
  const subscription = function (state) {
    console.log('the state updated: ' + state.title)
  }
  const model = {
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
  }
  const store = tansu(subscription)(model)

  console.log('the initial title is: ' + store.state.title) // logs 'the initial state is: foo'
  store.methods.update('bar') // logs 'the state updated: bar'
  store.methods.updateAsync('baz', 1000) // logs 'the state updated: baz' after 1 second
```

Composing models together

```javascript
  const tansu = require('tansu')
  const store = tansu()({
    state: {
      foo: 'foo'
    },
    reducers: {
      foo: function () {}
    },
    models: {
      levelTwo: {
        state: {
          foo: 'bar'
        },
        reducers: {
          foo: function () {}
        },
        models: {
          levelThree: {
            state: {
              foo: 'baz'
            },
            reducers: {
              foo: function () {}
            }
          }
        }
      }
    }
  })
  store.methods.foo() // calls parent model reducer
  store.methods.levelTwo.foo() // calls child model reducer
  store.methods.levelTwo.levelThree.foo() // calls child model reducer
```
