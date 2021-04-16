import { Box3, Object3D, Sphere } from 'three';
import { defaultValue } from './defaultValue';

class Object3DCollection extends Object3D {
    destroyChildren: Boolean;
    boundingBox: Box3;
    boundingSphere: Sphere;
    constructor(options?: { destroyChildren?: Boolean }) {
        super();

        options = defaultValue(options, {});
        this.destroyChildren = defaultValue(options.destroyChildren, true);

         //这个集合整体的包围盒
        this.boundingBox = new Box3();
        this.boundingSphere = new Sphere();

    }

    updateBoundingBox() {
        this.boundingBox.makeEmpty();
        this.boundingBox.expandByObject(this);
        this.boundingBox.getBoundingSphere(this.boundingSphere);
    }

}

export { Object3DCollection };
