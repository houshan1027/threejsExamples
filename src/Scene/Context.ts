import { defaultValue } from '../Core/defaultValue';
import {
    Color,
    DepthTexture,
    FrontSide,
    MeshDepthMaterial,
    NearestFilter,
    RGBADepthPacking,
    RGBAFormat,
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

    depthTextureDirty: Boolean;
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

        //当前的深度数据是否为之前帧的旧数据
        this.depthTextureDirty = true;
    }

    get depthTexture(): Texture {
        this.updateRenderTarget();
        return this.depthRenderTarget.texture;
    }

    private createRenderTarget(): WebGLRenderTarget {
        let buffer = this.renderer.drawingBufferSize;
        let renderTarget = new WebGLRenderTarget(buffer.width, buffer.height, {
            format: RGBAFormat
        });

        renderTarget.texture.minFilter = NearestFilter;
        renderTarget.texture.magFilter = NearestFilter;
        renderTarget.texture.generateMipmaps = false;

        return renderTarget;
    }

    //读取像素
    readPixels(readState: {
        height: Number;
        width: Number;
        x: Number;
        y: Number;
    }) {
        readState = defaultValue(readState, {});

        let gl = this.renderer.context;

        let x = Math.max(defaultValue(readState.x, 0), 0);
        let y = Math.max(defaultValue(readState.y, 0), 0);
        let width = defaultValue(readState.width, gl.drawingBufferWidth);
        let height = defaultValue(readState.height, gl.drawingBufferHeight);

        let pixels = new Uint8Array(4);

        this.updateRenderTarget();

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
        //如果不是旧数据
        if (!this.depthTextureDirty) {
            return;
        }

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

        //更新DepthTexture之后
        this.depthTextureDirty = false;
    }

    preUpdate(): void {}

    //渲染结束之后执行
    postRender() {
        this.depthTextureDirty = true;
    }
}

export { Context };
