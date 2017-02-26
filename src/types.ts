namespace Twine {
  export type Reducer = (state, ...args: any[]) => any
  export interface Reducers {
    [key: string]: Reducer
  }
  export type Effect = (state, methods, ...args: any[]) => any
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
  export type Subscription = (state, prev, methods: Methods) => any
  export interface ConfigurationOpts {
    onStateChange: Subscription
    onMethodCall: any
  }
  export type Configuration = Subscription | ConfigurationOpts
  export interface Methods {
    [key: string]: Reducer | Effect | Methods
  }
  export type State = any
  export interface Output {
    state: any
    methods: any
  }
  export type ReturnOutput = (model: Model) => Output
}

export default Twine
