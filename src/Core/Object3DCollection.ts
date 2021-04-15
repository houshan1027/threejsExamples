import { Object3D } from 'three';
import { defaultValue } from './defaultValue';

class Object3DCollection extends Object3D {
    destroyChildren: Boolean;
    constructor(options?: { destroyChildren?: Boolean }) {
        super();

        options = defaultValue(options, {});
        this.destroyChildren = defaultValue(options.destroyChildren, true);
    }
}

export { Object3DCollection };
