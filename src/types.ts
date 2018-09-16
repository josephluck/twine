export declare namespace Twine {
  export type Subscriber<State, Actions> = (state: State, prev: State, actions: Actions) => any
  export type OnReducerCalled<State> = (state: State, prev: State, name: string, ...args: any[]) => any
  export type OnEffectCalled<State> = (prev: State, name: string, ...args: any[]) => any

  export type Plugin<State, Actions> =
    | Subscriber<State, Actions>
    | {
      onStateChange?: Subscriber<State, Actions>
      onReducerCalled?: OnReducerCalled<State>
      onEffectCalled?: OnEffectCalled<State>
      wrapReducers?: (reducer: ReducerApi<any, any>) => ReducerApi<any, any>
      wrapEffects?: (effect: EffectApi<any, any>) => EffectApi<any, any>
    }

  export type Opts<State, Actions> = Plugin<State, Actions> | Plugin<State, Actions>[]

  export interface Return<State, Actions> {
    state: State
    actions: Actions
    subscribe: (callback: Subscriber<State, Actions>) => () => void
    getState: () => State
    replaceState: (newState: State) => void
  }
  export type State = any

  export type Computed<State> = (state: State) => State

  export type ReducerImpl<State, Payload = any> = (state: State, payload: Payload) => Partial<State>
  export type ReducerApi<State, Payload = any> = (payload: Payload) => State
  export interface Reducer<State, Payload = any> {
    implementation: ReducerImpl<State, Payload>
    api: ReducerApi<State, Payload>
  }

  export type Reducer0Impl<State, Payload = any> = (state: State) => Partial<State>
  export type Reducer0Api<State> = () => State
  export interface Reducer0<State> {
    implementation: Reducer0Impl<State>
    api: Reducer0Api<State>
  }

  export type EffectImpl<State, Actions, Payload = any, Return = void> = (state: State, actions: Actions, payload: Payload) => Return
  export type EffectApi<Payload = null, Return = void> = (payload: Payload) => Return
  export interface Effect<State, Actions, Payload = any, Return = void> {
    implementation: EffectImpl<State, Actions, Payload, Return>
    api: EffectApi<Payload, Return>
  }

  export type Effect0Impl<State, Actions, Return = void> = (state: State, actions: Actions) => Return
  export type Effect0Api<Return = void> = () => Return
  export interface Effect0<State, Actions, Return = void> {
    implementation: Effect0Impl<State, Actions, Return>
    api: Effect0Api<Return>
  }

  // Quick way to create actions from reducers & effects
  export type Actions<Reducers, Effects> = ReducersApi<Reducers> & EffectsApi<Effects>

  // Pluck out reducer & effect implementationementations and apis (see types for reducers and effects below)
  export type ReducersImpl<Reducers extends any> = {[Reducer in keyof Reducers]: Reducers[Reducer]['implementation']}
  export type EffectsImpl<Effects extends any> = {[Effect in keyof Effects]: Effects[Effect]['implementation']}
  export type ReducersApi<Reducers extends any> = {[Reducer in keyof Reducers]: Reducers[Reducer]['api']}
  export type EffectsApi<Effects extends any> = {[Effect in keyof Effects]: Effects[Effect]['api']}

  export interface Model<State, Reducers, Effects> {
    state: State
    reducers?: ReducersImpl<Reducers>
    effects?: EffectsImpl<Effects>
    scoped?: boolean
    computed?: Computed<State>
    models?: Record<string, Model<any, any, any>>
  }
  export interface ModelApi<State, Actions> {
    state: State
    actions: Actions
  }
  export type Models<Models extends any> = {
    state: {[Model in keyof Models]: Models[Model]['state']}
    actions: {[Model in keyof Models]: Models[Model]['actions']}
  }
}

export default Twine
