export declare type Subscriber = (state: State, prev: State, actions: any) => any;
export declare type OnReducerCalled = (state: State, prev: State, name: string, ...args: any[]) => any;
export declare type OnEffectCalled = (prev: State, name: string, ...args: any[]) => any;
export declare type Plugin = Subscriber | {
    onStateChange?: Subscriber;
    onReducerCalled?: OnReducerCalled;
    onEffectCalled?: OnEffectCalled;
};
export declare type Opts = Plugin | Plugin[];
export interface Model {
    state?: any;
    scoped?: boolean;
    reducers?: {
        [key: string]: (state: any, ...args: any[]) => any;
    };
    effects?: {
        [key: string]: (state: any, actions: any, ...args: any[]) => any;
    };
    models?: {
        [key: string]: Model;
    };
}
export interface State {
    [key: string]: State | any;
}
export declare function merge(model: Model, prop: string): any;
export declare function createState(model: Model): any;
export declare function retrieveNestedModel(model: Model, path: string[], index?: number): any;
export declare function getNestedObjFromPath(state: State, path: string[]): any;
export declare function updateStateAtPath(state: State, path: string[], value: any): State;
export declare function onStateChange(plugins: Plugin[], state: any, prev: any, actions: any): void[];
export declare function onReducerCalled(plugins: any, state: any, prev: any, name: any, args: any): any;
export declare function onEffectCalled(plugins: any, prev: any, name: any, args: any): any;
export default function twine(opts?: Opts): (model: Model) => {
    state: any;
    actions: any;
};
