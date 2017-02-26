export namespace Twine {
  export type Reducer = (state, ...args: any[]) => any
  export interface Reducers {
    [key: string]: Reducer
  }
  export type Effect = (state, actions, ...args: any[]) => any
  export interface Effects {
    [key: string]: Effect
  }
  export interface Model {
    scoped?: boolean
    state: any
    reducers?: Reducers
    effects?: Effects
    models?: Models
  }
  export interface Models {
    [key: string]: Model
  }
  export type Subscription = (state, prev, actions: Actions) => any
  export interface ConfigurationOpts {
    onStateChange: Subscription
    onMethodCall: any
  }
  export type Configuration = Subscription | ConfigurationOpts
  export interface Actions {
    [key: string]: Reducer | Effect | Actions
  }
  export type State = any
  export interface Output {
    state: any
    actions: any
  }
  export type ReturnOutput = (model: Model) => Output
}
