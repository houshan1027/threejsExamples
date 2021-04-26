import { OrientedBoundingBox } from '../Core/OrientedBoundingBox';
import { Sphere } from 'three/src/math/Sphere';
import { defined } from '../Core/defined';
import { Vector3 } from 'three';
import { Matrix3 } from '../Extended/Matrix3Extension';

var fromOrientedBoundingBoxScratchU = new Vector3();
var fromOrientedBoundingBoxScratchV: Vector3 = new Vector3();
var fromOrientedBoundingBoxScratchW = new Vector3();

(Sphere as any).fromOrientedBoundingBox = function(orientedBoundingBox: OrientedBoundingBox, result?: Sphere) {
    if (!defined(result)) {
        result = new Sphere();
    }

    var halfAxes = orientedBoundingBox.halfAxes;
    var u = (Matrix3 as any).getColumn(halfAxes, 0, fromOrientedBoundingBoxScratchU);
    var v = (Matrix3 as any).getColumn(halfAxes, 1, fromOrientedBoundingBoxScratchV);
    var w = (Matrix3 as any).getColumn(halfAxes, 2, fromOrientedBoundingBoxScratchW);

    u.add(v);
    u.add(w);

    result.center.copy(orientedBoundingBox.center);
    result.radius = u.length();

    return result;
};

export { Sphere };
