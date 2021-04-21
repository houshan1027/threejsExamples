import { defaultValue } from '../Core/defaultValue';
import {
    Color,
    DepthFormat,
    DepthTexture,
    FloatType,
    FrontSide,
    LinearFilter,
    MeshDepthMaterial,
    NearestFilter,
    RGBADepthPacking,
    RGBAFormat,
    RGBFormat,
    Scene,
    Texture,
    UnsignedShortType,
    Vector2,
    WebGLRenderTarget
} from 'three';
import { GlobeCamera } from './GlobeCamera';
import { GlobeScene } from './GlobeScene';
import { GlobeWebGLRenderer } from './GlobeWebGLRenderer';
import { defined } from '../Core/defined';
import { DeveloperError } from '../Core/DeveloperError';

let oldClearColor = new Color();

class Context {
    private scene: Scene;
    private camera: GlobeCamera;

    private readonly renderer: GlobeWebGLRenderer;
    private readonly depthMaterial: MeshDepthMaterial;

    depthTextureDirty: Boolean;
    depthRenderTarget: WebGLRenderTarget;

    constructor(scene: GlobeScene) {
        this.scene = scene;
        this.camera = undefined;
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

    get bufferSize(): Vector2 {
        return this.renderer.drawingBufferSize;
    }

    private createRenderTarget(): WebGLRenderTarget {
        let buffer = this.bufferSize;
        let renderTarget = new WebGLRenderTarget(buffer.width, buffer.height, { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat, type: FloatType });

        // renderTarget.texture.format = RGBAFormat;
        // renderTarget.texture.minFilter = NearestFilter;
        // renderTarget.texture.magFilter = NearestFilter;
        renderTarget.texture.generateMipmaps = false;

        return renderTarget;
    }

    updateCamera(camera: GlobeCamera) {
        this.camera = camera;
    }

    updateScene(scene: Scene) {
        this.scene = scene;
    }

    //读取像素
    readPixels(readState: { height: Number; width: Number; x: Number; y: Number }) {
        readState = defaultValue(readState, {});
        let bufferSize = this.bufferSize;

        let x = Math.max(defaultValue(readState.x, 0), 0);
        let y = Math.max(defaultValue(readState.y, 0), 0);
        let width = defaultValue(readState.width, bufferSize.width);
        let height = defaultValue(readState.height, bufferSize.height);

        let halfWidth = this.bufferSize.width / 2;
        let halfHeight = this.bufferSize.height / 2;

        x = x - halfWidth;
        y = y - halfHeight;

        let pixels = new Float32Array(4);

        this.updateRenderTarget();

        this.renderer.readRenderTargetPixels(this.depthRenderTarget, halfWidth + x, halfHeight - y, width, height, pixels);

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

        if (!defined(scene) || !defined(camera) || !defined(renderer)) {
            throw new DeveloperError('scene, camera或renderer参数不存在');
        }

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
        this.depthTextureDirty = true;
    }

    preUpdate(): void {}

    //渲染结束之后执行
    postRender() {
        this.depthTextureDirty = true;
    }
}

export { Context };
