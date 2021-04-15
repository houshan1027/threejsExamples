import { defaultValue } from '../Core/defaultValue';
import { PerspectiveCamera, Vector3 } from 'three';
import { GlobeScene } from './GlobeScene';
import { Event } from '../Core/Event';
import { defined } from '../Core/defined';

class GlobeCamera extends PerspectiveCamera {
    readonly scene: GlobeScene;
    readonly changed: Event;

    private changedDirection: any;
    private changedPosition: any;

    //渲染场景的宽
    containerWidth: Number;
    //渲染场景的高
    containerHeight: Number;

    constructor(options?: {
        scene: GlobeScene;
        fov?: Number;
        aspect?: Number;
        near?: Number;
        far: Number;
    }) {
        //视角
        let fov = defaultValue(options.fov, 60);

        //宽高比
        let aspect = defaultValue(
            options.aspect,
            window.innerWidth / window.innerHeight
        );

        //近裁剪面
        let near = defaultValue(options.near, 0.1);

        //远裁剪面
        let far = defaultValue(options.far, 1000000);
        super(fov, aspect, near, far);

        this.scene = options.scene;

        this.changed = new Event();
        this.changedPosition = undefined;
        this.changedDirection = undefined;
    }

    resize(container: Element) {
        let { clientWidth, clientHeight } = container;

        this.aspect = clientWidth / clientHeight;

        this.updateProjectionMatrix();

        this.containerWidth = clientWidth;

        this.containerHeight = clientHeight;
    }

    _updateCameraChanged() {
        let camera = this;

        if (camera.changed.numberOfListeners === 0) {
            return;
        }

        if (!defined(camera.changedDirection)) {
            camera.changedDirection = new Vector3().copy(camera.position);
            camera.changedDirection = camera.getWorldDirection(new Vector3());
            return;
        }
    }
}

export { GlobeCamera };
