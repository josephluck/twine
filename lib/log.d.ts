import Twine from './types';
export interface Log {
    onReducerCalled: Twine.OnReducerCalled;
    onEffectCalled: Twine.OnEffectCalled;
}
declare const log: Log;
export default log;
