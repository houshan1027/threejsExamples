import { Vector3 } from '../Extended/Vector3Extension';
import { Matrix3 } from 'three';

class OrientedBoundingBox {
    center: Vector3;
    halfAxes: Matrix3;
    constructor(center = new Vector3(), halfAxes = new Matrix3()) {
        /**
         * The center of the box.
         * @type {Cartesian3}
         * @default {@link Cartesian3.ZERO}
         */
        this.center = new Vector3().copy(center);
        /**
         * The transformation matrix, to rotate the box to the right position.
         * @type {Matrix3}
         * @default {@link Matrix3.ZERO}
         */
        this.halfAxes = new Matrix3().copy(halfAxes);
    }
}

export { OrientedBoundingBox };
