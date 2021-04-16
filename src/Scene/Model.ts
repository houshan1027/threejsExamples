import { Check } from '../Core/Check';
import { Object3D } from '../Extended/Object3DExtension';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Event } from '../Core/Event';
import { Object3DCollection } from '../Core/Object3DCollection';

interface ModelConstructorParameters {
    url: string;
    decoderPath: string;
}

class Model extends Object3DCollection {
    readonly url: string;
    gltfLoader: GLTFLoader;
    dracoLoader: DRACOLoader;
    readonly readyEvent: Event;

    constructor(options: ModelConstructorParameters) {
        super();

        this.url = options.url;

        this.gltfLoader = undefined;
        this.dracoLoader = undefined;

        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this.readyEvent = new Event();
    }

    static fromUrl(options: ModelConstructorParameters) {
        let model = new Model(options);
        Check.defined('options.url', options.url);

        model.dracoLoader.setDecoderPath(options.decoderPath);
        model.load();

        return model;
    }

    load(): void {
        this.gltfLoader.loadAsync(this.url).then(object => {
            this.addObject(object.scene);
            this.updateBoundingBox();
            this.readyEvent.raiseEvent();
        });
    }
}

export { Model };
