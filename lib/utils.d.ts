import Twine from './types';
export declare function noop(): any;
export declare function arrayToObj(curr: any, prev: any): any;
export declare function mergeState(model: Twine.ModelImpl<any, any, any>): any;
export declare function createState(model: Twine.ModelImpl<any, any, any>): any;
export declare function retrieveNestedModel(model: Twine.ModelImpl<any, any, any>, path: string[], index?: number): Twine.ModelImpl<any, any, any>;
export declare function getStateFromPath(state: Twine.State, path: string[]): Twine.State;
export declare function updateStateAtPath(state: Twine.State, path: string[], value: any): any;
export declare function recursivelyUpdateComputedState(model: Twine.ModelImpl<any, any, any>, state: Twine.State, path: string[]): Twine.State;
