export type Subscriber = (state: State, prev: State, actions: any) => any
export type OnReducerCalled = (state: State, prev: State, name: string, ...args: any[]) => any
export type OnEffectCalled = (prev: State, name: string, ...args: any[]) => any

export type Plugin =
  | Subscriber
  | {
      onStateChange?: Subscriber
      onReducerCalled?: OnReducerCalled
      onEffectCalled?: OnEffectCalled
    }

export type Opts = Plugin | Plugin[]

export interface Model {
  state?: any
  computed?: (state: any) => any
  scoped?: boolean
  reducers?: {
    [key: string]: (state: any, ...args: any[]) => any
  }
  effects?: {
    [key: string]: (state: any, actions: any, ...args: any[]) => any
  }
  models?: {
    [key: string]: Model
  }
}

export interface State {
  [key: string]: State | any
}
