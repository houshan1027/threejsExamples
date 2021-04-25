import { defaultValue } from '../Core/defaultValue';
import {
    Camera,
    Color,
    DepthFormat,
    DepthTexture,
    EventDispatcher,
    FloatType,
    FrontSide,
    LinearFilter,
    MeshDepthMaterial,
    NearestFilter,
    PerspectiveCamera,
    RGBADepthPacking,
    RGBAFormat,
    RGBFormat,
    Scene,
    Texture,
    UnsignedShortType,
    Vector2,
    WebGLMultisampleRenderTarget,
    WebGLRenderTarget
} from 'three';
import { GlobeCamera } from './GlobeCamera';
import { GlobeScene } from './GlobeScene';
import { GlobeWebGLRenderer } from './GlobeWebGLRenderer';
import { defined } from '../Core/defined';
import { DeveloperError } from '../Core/DeveloperError';
import { Check } from '../Core/Check';

let oldClearColor = new Color();

class Context extends EventDispatcher {
    private scene: Scene;
    private camera: GlobeCamera;

    private readonly renderer: GlobeWebGLRenderer;
    private readonly depthMaterial: MeshDepthMaterial;

    depthTextureDirty: Boolean;
    depthRenderTarget: WebGLRenderTarget;

    constructor(scene: GlobeScene) {
        super();
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

        renderTarget.texture.generateMipmaps = false;

        return renderTarget;
    }

    updateRenderState(options: { camera: any; scene: Scene }) {
        this.camera = options.camera;
        this.scene = options.scene;
    }

    //读取像素
    readPixels(readState: {
        height: Number;
        width: Number;
        x: Number;
        y: Number;
        renderTarget: WebGLRenderTarget | WebGLMultisampleRenderTarget;
        scene: Scene;
        camera: PerspectiveCamera;
    }) {
        readState = defaultValue(readState, {});
        let bufferSize = this.bufferSize;

        let x = Math.max(defaultValue(readState.x, 0), 0);
        let y = Math.max(defaultValue(readState.y, 0), 0);
        let width = defaultValue(readState.width, bufferSize.width);
        let height = defaultValue(readState.height, bufferSize.height);

        //要被读取颜色的RTTexture
        let renderTarget = readState.renderTarget;
        let camera = readState.camera;
        let scene = readState.scene;
        let renderer = this.renderer;
        let domElement = renderer.domElement;

        Check.defined('readState.renderTarget', renderTarget);

        let currentRenderTarget = renderer.getRenderTarget();
        renderer.getClearColor(oldClearColor);
        let oldClearAlpha = renderer.getClearAlpha();
        let oldAutoAClear = renderer.autoClear;
        // let currentXrEnabled = renderer.xr.enabled;
        // let currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

        // // camera.setViewOffset(domElement.width, domElement.height, (x * window.devicePixelRatio) | 0, (y * window.devicePixelRatio) | 0, 1, 1);

        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 1);

        renderer.clear();
        renderTarget.setSize(width, height);
        renderer.setRenderTarget(renderTarget);
        renderer.clear();
        renderer.render(scene, camera);

        renderer.setClearColor(oldClearColor);
        renderer.setClearAlpha(oldClearAlpha);
        renderer.autoClear = oldAutoAClear;

        this.dispatchEvent({ type: 'render', res: renderTarget });
        renderer.setRenderTarget(currentRenderTarget);

        let pixels = new Float32Array(4);
        this.renderer.readRenderTargetPixels(renderTarget, x, y, 1, 1, pixels);
        // console.log(pixels);

        return pixels;
    }

    //更新RTT
    updateRenderTarget(): void {
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
