import {
    Color,
    DepthTexture,
    NearestFilter,
    RGBFormat,
    WebGLRenderTarget
} from 'three';
import { GlobeCamera } from './GlobeCamera';
import { GlobeScene } from './GlobeScene';
import { GlobeWebGLRenderer } from './GlobeWebGLRenderer';

let oldClearColor = new Color();

class Context {
    private readonly scene: GlobeScene;
    private readonly renderer: GlobeWebGLRenderer;
    private readonly camera: GlobeCamera;

    renderTarget: WebGLRenderTarget;

    constructor(scene: GlobeScene) {
        this.scene = scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;

        //创建renderTarget
        this.renderTarget = this.createRenderTarget();
    }

    private createRenderTarget(): WebGLRenderTarget {
        let buffer = this.renderer.drawingBufferSize;
        let renderTarget = new WebGLRenderTarget(buffer.width, buffer.height, {
            format: RGBFormat
        });

        renderTarget.texture.minFilter = NearestFilter;
        renderTarget.texture.magFilter = NearestFilter;
        renderTarget.texture.generateMipmaps = false;

        return renderTarget;
    }

    //更新RTT
    updateRenderTarget(): void {
        let renderer = this.renderer;
        //拿到原始清空色
        renderer.getClearColor(oldClearColor);
        let oldClearAlpha = renderer.getClearAlpha();
        let oldAutoAClear = renderer.autoClear;
        let currentRenderTarget = renderer.getRenderTarget();
        let currentXrEnabled = renderer.xr.enabled;
        let currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 1);
    }

    update(): void {
        this.updateRenderTarget();
    }
}

export { Context };
