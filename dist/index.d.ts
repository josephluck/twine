export declare type Reducer = (state, ...args: any[]) => any;
export interface Reducers {
    [key: string]: Reducer;
}
export declare type Effect = (state, actions, ...args: any[]) => any;
export interface Effects {
    [key: string]: Effect;
}
export interface Model {
    scoped?: boolean;
    state: any;
    reducers?: Reducers;
    effects?: Effects;
    models?: Models;
}
export interface Models {
    [key: string]: Model;
}
export declare type Subscription = (state, prev, actions: Actions) => any;
export interface ConfigurationOpts {
    onStateChange: Subscription;
    onMethodCall: any;
}
export declare type Configuration = Subscription | ConfigurationOpts;
export interface Actions {
    [key: string]: Reducer | Effect | Actions;
}
export declare type State = any;
export interface Output {
    state: any;
    actions: any;
}
export declare type ReturnOutput = (model: Model) => Output;
export default function twine(opts?: Configuration): ReturnOutput;
