import { Check } from '../Core/Check';
import { defaultValue } from '../Core/defaultValue';
import { Vector4 } from 'three';
import { defined } from '../Core/defined';

// declare interface Vector4 {
//     unpack(array: Number[], startingIndex: Number, result: Vector4): Vector4;
// }
export interface unpackF {
    unpack(array: any, startingIndex: number, result: any): Vector4;
}
export const unpack = ((Vector4 as any).unpack = function(
    array: Number[],
    startingIndex: number,
    result: any
): Vector4 {
    Check.defined('array', array);

    if (!defined(result)) {
        result = new Vector4();
    }
    result.x = array[startingIndex++];
    result.y = array[startingIndex++];
    result.z = array[startingIndex++];
    result.w = array[startingIndex];
    return result;
});

(Vector4 as any).UNIT_W = Object.freeze(new Vector4(0, 0, 0, 1));

export { Vector4 };
