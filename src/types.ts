export namespace Twine {
  export type Subscriber<S = State, A = any> = (state: S, prev: S, actions: A) => any
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

  export interface Return<S, A> {
    state: S
    actions: A
    subscribe: Subscriber<S, A>
  }
  export type State = any

  export type Computed<S> = (state: S) => S
  export type Reducer<S, P extends Record<string, any> = {}> = (params: { state?: S } & P) => S
  export type Effect<S, A, P extends Record<string, any> = {}, R = void> = (
    params: { state?: S; actions?: A } & P,
  ) => R
  export type Actions<
    R extends Record<any, Reducer<any>>,
    E extends Record<any, Effect<any, any>>
  > = R & E

  export interface ModelImpl<
    S extends State,
    R extends Record<any, Reducer<S, any>>,
    E extends Record<any, Effect<any, any>>
  > {
    state: S
    reducers: R
    effects: E
    scoped?: boolean
    computed?: Computed<S>
    models?: Record<string, ModelImpl<any, any, any>>
  }
  export interface ModelApi<S, A> {
    state: S
    actions: A
  }
}
