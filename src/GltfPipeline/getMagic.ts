import { getStringFromTypedArray } from '../Core/getStringFromTypedArray';

/**
 * @private
 */
function getMagic(uint8Array: Uint8Array, byteOffset = 0) {
    return getStringFromTypedArray(uint8Array, byteOffset, Math.min(4, uint8Array.length));
}

export { getMagic };
