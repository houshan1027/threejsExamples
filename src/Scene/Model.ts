import { Check } from '../Core/Check';
import { Object3D } from '../Extended/Object3DExtension';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Event } from '../Core/Event';
import { Object3DCollection } from '../Core/Object3DCollection';
import { defined } from '../Core/defined';
import { GLTFLoader } from '../ThirdParty/GLTFLoader';

interface ModelConstructorParameters {
    url: string;
    decoderPath: string;
    gltf?: any;
}

class Model extends Object3DCollection {
    readonly url: string;
    gltfLoader: GLTFLoader;
    dracoLoader: DRACOLoader;
    readonly readyEvent: Event;
    _readyPromise: any;

    constructor() {
        super();

        this.gltfLoader = undefined;
        this.dracoLoader = undefined;

        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this._readyPromise = undefined;
    }

    get readyPromise() {
        return this._readyPromise;
    }

    static fromUrl(options: ModelConstructorParameters) {
        let model = new Model();
        Check.defined('options.url', options.url);

        model.dracoLoader.setDecoderPath(options.decoderPath);
        model.load(options.url);

        return model;
    }

    //根据B3DM的二进制数据加载模型
    static fromB3DMArrayBuffer(options: { arrayBuffer: ArrayBuffer }) {
        let model = new Model();
        return model.loadArraybuffer(options.arrayBuffer);
    }

    load(url: string): void {
        this._readyPromise = this.gltfLoader.loadAsync(url).then(object => {
            this.addObject(object.scene);
            this.updateBoundingBox();
            return this;
        });
    }

    loadArraybuffer(arrayBuffer: ArrayBuffer): void {
        this._readyPromise = new Promise(resolve => {
            this.gltfLoader.parse(arrayBuffer, undefined, object => {
                this.addObject(object.scene);
                resolve(this);
            });
        });
    }
}

export { Model };
