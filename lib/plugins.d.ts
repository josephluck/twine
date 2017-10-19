import Twine from './types';
export declare function onStateChange(plugins: Twine.Plugin[], state: any, prev: any, actions: any): void[];
export declare function onReducerCalled(plugins: Twine.Plugin[], state: any, prev: any, name: any, args: any): void[];
export declare function onEffectCalled(plugins: Twine.Plugin[], prev: any, name: any, args: any): void[];
export declare function wrapReducer(plugins: Twine.Plugin[], reducer: Twine.ReducerApi<any, any>): Twine.Plugin;
export declare function wrapEffect(plugins: Twine.Plugin[], effect: Twine.EffectApi<any, any>): Twine.Plugin;
