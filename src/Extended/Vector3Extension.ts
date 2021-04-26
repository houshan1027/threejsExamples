import { Vector3 } from 'three/src/math/Vector3';

declare module 'three/src/math/Vector3' {
    export interface Vector3 {
        packedLength: number;
    }
}

(Vector3 as any).packedLength = Object.freeze(3.0);

export { Vector3 };
