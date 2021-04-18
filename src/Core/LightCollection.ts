import { AmbientLight, DirectionalLight } from 'three';
import { defined } from './defined';
import { Object3DCollection } from './Object3DCollection';

class LightCollection extends Object3DCollection {
    private defaultAmbientLight: AmbientLight;
    private defaultDirectionalLight: DirectionalLight;

    private _enabled: Boolean;

    constructor() {
        super();
        this.defaultAmbientLight = undefined;
        this.defaultDirectionalLight = undefined;

        //是否开启该集合中的灯光
        this._enabled = true;

        //初始化的时候，添加默认灯光
        this.addDefaultLight();
    }

    get enabled(): Boolean {
        return this._enabled;
    }

    set enabled(value: Boolean) {
        // if(value)
    }

    //创建默认的灯光
    addDefaultLight(): void {
        this.defaultAmbientLight = new AmbientLight(0xffffff, 0.5);
        this.addObject(this.defaultAmbientLight);

        this.defaultDirectionalLight = new DirectionalLight(0xffffff, 1);
        this.defaultDirectionalLight.position.set(5, 10, 7.5);
        this.addObject(this.defaultDirectionalLight);
    }

    //移除默认灯光
    removeDefaultLight(): void {
        if (defined(this.defaultAmbientLight)) {
            this.removeObject(this.defaultAmbientLight);
        }
        if (defined(this.defaultDirectionalLight)) {
            this.removeObject(this.defaultDirectionalLight);
        }
    }
}

export { LightCollection };
