import { Twine } from './types';
export declare function getNestedObjFromPath(state: any, path: any[]): any;
export declare function updateStateAtPath(obj: any, path: any, value: any): any;
export default function twine(opts?: Twine.Configuration): Twine.ReturnOutput;
