export declare type Subscriber = (state: State, prev: State, actions: any) => any;
export declare type OnMethodCall = (state: State, prev: State, ...args: any[]) => any;
export declare type Opts = Subscriber | {
    onStateChange: Subscriber;
    onMethodCall: OnMethodCall;
};
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
export default function twine(opts?: Opts): (model: Model) => {
    state: any;
    actions: any;
};