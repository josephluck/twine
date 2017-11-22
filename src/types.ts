export declare namespace Twine {
  export type Subscriber<S, A> = (state: S, prev: S, actions: A) => any
  export type OnReducerCalled<S> = (state: S, prev: S, name: string, ...args: any[]) => any
  export type OnEffectCalled<S> = (prev: S, name: string, ...args: any[]) => any

  export type Plugin<S, A> =
    | Subscriber<S, A>
    | {
        onStateChange?: Subscriber<S, A>
        onReducerCalled?: OnReducerCalled<S>
        onEffectCalled?: OnEffectCalled<S>
        wrapReducers?: (reducer: ReducerApi<any, any>) => ReducerApi<any, any>
        wrapEffects?: (effect: EffectApi<any, any>) => EffectApi<any, any>
      }

  export type Opts<S, A> = Plugin<S, A> | Plugin<S, A>[]

  export interface Return<S, A> {
    state: S
    actions: A
    subscribe: (fn: Subscriber<S, A>) => () => void
  }
  export type State = any

  export type Computed<S> = (state: S) => S

  export type ReducerImpl<S, P = any> = (state: S, payload: P) => Partial<S>
  export type ReducerApi<S, P = any> = (payload: P) => S
  export interface Reducer<S, P = any> {
    implementation: ReducerImpl<S, P>
    api: ReducerApi<S, P>
  }

  export type Reducer0Impl<S, P = any> = (state: S) => Partial<S>
  export type Reducer0Api<S> = () => S
  export interface Reducer0<S> {
    implementation: Reducer0Impl<S>
    api: Reducer0Api<S>
  }

  export type EffectImpl<S, A, P = any, R = void> = (state: S, actions: A, payload: P) => R
  export type EffectApi<P = null, R = void> = (payload: P) => R
  export interface Effect<S, A, P = any, R = void> {
    implementation: EffectImpl<S, A, P, R>
    api: EffectApi<P, R>
  }

  export type Effect0Impl<S, A, R = void> = (state: S, actions: A) => R
  export type Effect0Api<R = void> = () => R
  export interface Effect0<S, A, R = void> {
    implementation: Effect0Impl<S, A, R>
    api: Effect0Api<R>
  }

  // Quick way to create actions from reducers & effects
  export type Actions<R, E> = ReducersApi<R> & EffectsApi<E>

  // Pluck out reducer & effect implementationementations and apis (see types for reducers and effects below)
  export type ReducersImpl<R extends any> = { [P in keyof R]: R[P]['implementation'] }
  export type EffectsImpl<E extends any> = { [P in keyof E]: E[P]['implementation'] }
  export type ReducersApi<R extends any> = { [P in keyof R]: R[P]['api'] }
  export type EffectsApi<E extends any> = { [P in keyof E]: E[P]['api'] }

  export interface Model<S, R, E> {
    state: S
    reducers?: ReducersImpl<R>
    effects?: EffectsImpl<E>
    scoped?: boolean
    computed?: Computed<S>
    models?: Record<string, Model<any, any, any>>
  }
  export interface ModelApi<S, A> {
    state: S
    actions: A
  }
  export type Models<M extends any> = {
    state: { [N in keyof M]: M[N]['state'] }
    actions: { [N in keyof M]: M[N]['actions'] }
  }
}

export default Twine
