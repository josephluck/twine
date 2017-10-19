export declare namespace Twine {
    type Subscriber<S = State, A = any> = (state: S, prev: S, actions: A) => any;
    type OnReducerCalled = (state: State, prev: State, name: string, ...args: any[]) => any;
    type OnEffectCalled = (prev: State, name: string, ...args: any[]) => any;
    type Plugin = Subscriber | {
        onStateChange?: Subscriber;
        onReducerCalled?: OnReducerCalled;
        onEffectCalled?: OnEffectCalled;
        wrapReducers?: (reducer: ReducerApi<any, any>) => ReducerApi<any, any>;
        wrapEffects?: (effect: EffectApi<any, any>) => EffectApi<any, any>;
    };
    type Opts = Plugin | Plugin[];
    interface Return<S, A> {
        state: S;
        actions: A;
        subscribe: Subscriber<S, A>;
    }
    type State = any;
    type Computed<S> = (state: S) => S;
    type ReducerImpl<S, P = any> = (state: S, payload: P) => Partial<S>;
    type ReducerApi<S, P = any> = (payload: P) => S;
    interface Reducer<S, P = any> {
        implementation: ReducerImpl<S, P>;
        api: ReducerApi<S, P>;
    }
    type EffectImpl<S, A, P = any, R = void> = (state: S, actions: A, payload: P) => R;
    type EffectApi<P = null, R = void> = (payload: P) => R;
    interface Effect<S, A, P = any, R = void> {
        implementation: EffectImpl<S, A, P, R>;
        api: EffectApi<P, R>;
    }
    type Actions<R, E> = ReducersApi<R> & EffectsApi<E>;
    type ReducersImpl<R extends any> = {
        [P in keyof R]: R[P]['implementation'];
    };
    type EffectsImpl<E extends any> = {
        [P in keyof E]: E[P]['implementation'];
    };
    type ReducersApi<R extends any> = {
        [P in keyof R]: R[P]['api'];
    };
    type EffectsApi<E extends any> = {
        [P in keyof E]: E[P]['api'];
    };
    interface ModelImpl<S extends State, R extends Record<any, Reducer<S, any>>, E extends Record<any, Effect<any, any>>> {
        state: S;
        reducers?: ReducersImpl<R>;
        effects?: EffectsImpl<E>;
        scoped?: boolean;
        computed?: Computed<S>;
        models?: Record<string, ModelImpl<any, any, any>>;
    }
    interface ModelApi<S, A> {
        state: S;
        actions: A;
    }
}
export default Twine;
