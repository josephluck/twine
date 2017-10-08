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

export type Reducer<S> = (params: { state: S }) => Partial<S>
export type Effect<S, A> = (params: { state: S; actions: A }) => any

export interface ModelImpl<
  S,
  R extends Record<string, Reducer<S>>,
  E extends Record<string, Effect<any, any>>
> {
  scoped?: boolean
  state?: any
  computed?: (state: S) => Partial<S>
  reducers?: R
  effects?: E
  models?: {
    [key: string]: ModelImpl<any, any, any>
  }
}

export interface State {
  [key: string]: State | any
}

export type Subscribe<S, A> = (state: S, prev: S, actions: A) => () => any

export interface Return<S, A> {
  actions: A
  state: A
  subscribe: Subscribe<S, A>
}
