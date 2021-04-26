import { Vector3 } from '../Extended/Vector3Extension';
import { OrientedBoundingBox } from '../Core/OrientedBoundingBox';
import { Matrix3 } from 'three';
import { Sphere } from '../Extended/SphereExtension';

class TileOrientedBoundingBox {
    _orientedBoundingBox: OrientedBoundingBox;
    _boundingSphere: Sphere;
    constructor(center: Vector3, halfAxes: Matrix3) {
        this._orientedBoundingBox = new OrientedBoundingBox(center, halfAxes);
        this._boundingSphere = (Sphere as any).fromOrientedBoundingBox(this._orientedBoundingBox);
    }

    update(center: Vector3, halfAxes: Matrix3) {
        this._orientedBoundingBox.center.copy(center);
        this._orientedBoundingBox.halfAxes.copy(halfAxes);
        (Sphere as any).fromOrientedBoundingBox(this._orientedBoundingBox, this._boundingSphere);
    }
}

export { TileOrientedBoundingBox };
