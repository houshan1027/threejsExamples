import { defaultValue } from '../Core/defaultValue';
import {
    Color,
    DepthTexture,
    FrontSide,
    MeshDepthMaterial,
    NearestFilter,
    RGBADepthPacking,
    RGBFormat,
    Texture,
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
    private readonly depthMaterial: MeshDepthMaterial;

    depthRenderTarget: WebGLRenderTarget;

    constructor(scene: GlobeScene) {
        this.scene = scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;

        //创建renderTarget
        this.depthRenderTarget = this.createRenderTarget();

        //深度覆盖材质
        this.depthMaterial = new MeshDepthMaterial({
            side: FrontSide,
            depthPacking: RGBADepthPacking
        });
    }

    get depthTexture(): Texture {
        return this.depthRenderTarget.texture;
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

    //读取像素
    readPixels(readState: {
        renderTarget: WebGLRenderTarget;
        height: number;
        width: number;
        x: number;
        y: number;
    }) {
        readState = defaultValue(readState, {});

        let gl = this.renderer.context;

        let x = Math.max(defaultValue(readState.x, 0), 0);
        let y = Math.max(defaultValue(readState.y, 0), 0);
        let width = defaultValue(readState.width, gl.drawingBufferWidth);
        let height = defaultValue(readState.height, gl.drawingBufferHeight);

        let pixels = new Uint8Array(4);

        this.renderer.readRenderTargetPixels(
            this.depthRenderTarget,
            x,
            y,
            width,
            height,
            pixels
        );

        return pixels;
    }

    //更新RTT
    updateRenderTarget(): void {
        let renderer = this.renderer;
        let scene = this.scene;
        let camera = this.camera;

        //拿到原始清空色
        renderer.getClearColor(oldClearColor);
        let oldClearAlpha = renderer.getClearAlpha();
        let oldAutoAClear = renderer.autoClear;
        let currentRenderTarget = renderer.getRenderTarget();
        let currentXrEnabled = renderer.xr.enabled;
        let currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
        let oldSceneEnv = scene.environment;
        let oldBackground = scene.background;

        scene.overrideMaterial = this.depthMaterial;
        scene.environment = undefined;
        scene.background = undefined;

        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 1);
        renderer.setRenderTarget(this.depthRenderTarget);
        renderer.clear();

        //以深度材质渲染一遍
        renderer.render(scene, camera);
        scene.overrideMaterial = null;

        //renderer配置还原
        renderer.setClearColor(oldClearColor);
        renderer.setClearAlpha(oldClearAlpha);
        renderer.autoClear = oldAutoAClear;
        renderer.xr.enabled = currentXrEnabled;
        renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
        renderer.setRenderTarget(currentRenderTarget);

        scene.background = oldBackground;
        scene.environment = oldSceneEnv;
    }

    update(): void {
        this.updateRenderTarget();
    }
}

export { Context };
