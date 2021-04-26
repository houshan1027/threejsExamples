import { defaultValue } from './defaultValue';
import { defined } from './defined';

/**
 * Merges two objects, copying their properties onto a new combined object. When two objects have the same
 * property, the value of the property on the first object is used.  If either object is undefined,
 * it will be treated as an empty object.
 *
 * @example
 * let object1 = {
 *     propOne : 1,
 *     propTwo : {
 *         value1 : 10
 *     }
 * }
 * let object2 = {
 *     propTwo : 2
 * }
 * let final = Cesium.combine(object1, object2);
 *
 * // final === {
 * //     propOne : 1,
 * //     propTwo : {
 * //         value1 : 10
 * //     }
 * // }
 *
 * @param {Object} [object1] The first object to merge.
 * @param {Object} [object2] The second object to merge.
 * @param {Boolean} [deep=false] Perform a recursive merge.
 * @returns {Object} The combined object containing all properties from both objects.
 *
 * @exports combine
 */
function combine(object1: any, object2: any, deep?: boolean) {
    deep = defaultValue(deep, false);

    let result: any = {};

    let object1Defined = defined(object1);
    let object2Defined = defined(object2);
    let property;
    let object1Value;
    let object2Value;
    if (object1Defined) {
        for (property in object1) {
            if (object1.hasOwnProperty(property)) {
                object1Value = object1[property];
                if (object2Defined && deep && typeof object1Value === 'object' && object2.hasOwnProperty(property)) {
                    object2Value = object2[property];
                    if (typeof object2Value === 'object') {
                        result[property] = combine(object1Value, object2Value, deep);
                    } else {
                        result[property] = object1Value;
                    }
                } else {
                    result[property] = object1Value;
                }
            }
        }
    }
    if (object2Defined) {
        for (property in object2) {
            if (object2.hasOwnProperty(property) && !result.hasOwnProperty(property)) {
                object2Value = object2[property];
                result[property] = object2Value;
            }
        }
    }
    return result;
}
export { combine };
