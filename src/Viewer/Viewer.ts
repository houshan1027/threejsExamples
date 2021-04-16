import { defined } from '../Core/defined';
import {
    BoxBufferGeometry,
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    TorusKnotBufferGeometry,
    WebGLRenderer
} from 'three';
import { GlobeCamera } from '../Scene/GlobeCamera';
import { GlobeScene } from '../Scene/GlobeScene';
import { Widgets } from '../Widgets/Widget';

class Viewer {
    readonly widget: Widgets;
    readonly scene: GlobeScene;
    readonly camera: GlobeCamera;
    readonly renderer: WebGLRenderer;

    defaultBox: Mesh;
    constructor(
        container: Element | String,
        options?: {
            useDefaultRenderLoop?: Boolean;
            renderState?: {};
            enabledEffect?: Boolean;
            targetFrameRate?: Number;
        }
    ) {
        this.widget = new Widgets(container, options);

        this.scene = this.widget.scene;
        this.camera = this.widget.camera;
        this.renderer = this.widget.renderer;

        this.defaultBox = undefined;

        this.addDefaultBox();
    }

    addDefaultBox(): void {
        const geometry = new BoxBufferGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({
            color: 0xffc107,
            metalness: 0.1,
            roughness: 0.75
        });

        this.defaultBox = new Mesh(geometry, material);
        this.scene.addObject(this.defaultBox);
    }

    removeDefaultBox(): void {
        if (defined(this.defaultBox)) {
            this.scene.removeObject(this.defaultBox);
        }
    }

    get background(): any {
        return this.scene.background;
    }

    set background(value: any) {
        if (defined(this.background)) {
            this.background.dispose();
        }
        this.scene.background = value;
    }

    get screenSpaceCameraController() {
        return this.scene.screenSpaceCameraController;
    }
}

export { Viewer };
