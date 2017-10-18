export type Subscriber<S = State, A = any> = (state: S, prev: S, actions: A) => any
export type OnReducerCalled = (state: State, prev: State, name: string, ...args: any[]) => any
export type OnEffectCalled = (prev: State, name: string, ...args: any[]) => any

export type Plugin =
  | Subscriber
  | {
    onStateChange?: Subscriber
    onReducerCalled?: OnReducerCalled
    onEffectCalled?: OnEffectCalled
    wrapReducers?: (reducer: ReducerImpl<any, any>) => ReducerImpl<any, any>
    wrapEffects?: (effect: EffectImpl<any, any>) => EffectImpl<any, any>
  }

export type Opts = Plugin | Plugin[]

export interface Return<S, A> {
  state: S
  actions: A
  subscribe: Subscriber<S, A>
}
export type State = any

export type Computed<S> = (state: S) => S

export type ReducerImpl<S, P=null> = (state: S, payload: P) => Partial<S>
export type ReducerApi<S, P=null> = (payload: P) => S
export interface Reducer<S, P=null> {
  implementation: ReducerImpl<S, P>
  api: ReducerApi<S, P>
}

export type EffectImpl<S, A, P=null, R=void> = (state: S, actions: A, payload: P) => R
export type EffectApi<P=null, R=void> = (payload: P) => R
export interface Effect<S, A, P=null, R=void> {
  implementation: EffectImpl<S, A, P, R>
  api: EffectApi<P, R>
}

// Quick way to create actions from reducers & effects
export type Actions<R, E> = ReducersApi<R> & EffectsApi<E>

// Pluck out reducer & effect implementationementations and apis (see types for reducers and effects below)
export type ReducersImpl<R extends any> = {[P in keyof R]: R[P]['implementation']}
export type EffectsImpl<E extends any> = {[P in keyof E]: E[P]['implementation']}
export type ReducersApi<R extends any> = {[P in keyof R]: R[P]['api']}
export type EffectsApi<E extends any> = {[P in keyof E]: E[P]['api']}

export interface ModelImpl<
  S extends State,
  R extends Record<any, Reducer<S, any>>,
  E extends Record<any, Effect<any, any>>
  > {
  state: S
  reducers?: ReducersImpl<R>
  effects?: EffectsImpl<E>
  scoped?: boolean
  computed?: Computed<S>
  models?: Record<string, ModelImpl<any, any, any>>
}
export interface ModelApi<S, A> {
  state: S
  actions: A
}
