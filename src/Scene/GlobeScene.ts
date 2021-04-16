import { defaultValue } from '../Core/defaultValue';
import {
    Clock,
    LinearToneMapping,
    PMREMGenerator,
    Scene,
    sRGBEncoding,
    UnsignedByteType,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';
import { GlobeCamera } from './GlobeCamera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Event } from '../Core/Event';
import { Object3D } from '../Extended/Object3DExtension';
import '../Extended/Object3DExtension';
import { LightCollection } from '../Core/LightCollection';
import { Object3DCollection } from '../Core/Object3DCollection';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { ResourceFetchHdrParameters, Resource } from '../Core/Resource';
import { GlobeWebGLRenderer } from './GlobeWebGLRenderer';

interface SceneOptions {
    renderState?: {};
    enabledEffect?: Boolean;
    requestRenderMode?: Boolean;
}

export interface FrameStateInterFace {
    //帧数的累计
    frameNumber: any;
    //最大纹理各向异性
    maxAnisotropy: Number;
    //分辨率
    pixelRatio: Number;
    //渲染尺寸
    bufferSize: Vector2;
}

//用于保存绘制缓冲区的宽高
const bufferSize = new Vector2();

let originTransformVector3 = new Vector3();

function tryAndCatchError(scene: GlobeScene, functionToExecute: Function) {
    try {
        functionToExecute(scene);
    } catch (error) {
        //渲染发生错误，则进行捕获
        scene.renderError.raiseEvent(scene, error);
        console.log(error);
        if (scene.rethrowRenderErrors) {
            throw error;
        }
    }
}

function render(scene: GlobeScene) {
    let frameState = scene.frameState;

    // scene.globalContext.update();

    //执行每一帧的updateFixedFrame函数
    scene.executeUpdate();

    //渲染开始事件的回调
    scene.renderStart.raiseEvent();

    //如果使用了后处理
    if (scene.enabledEffect) {
        //执行基于后处理的·1渲染
        // scene.effectComposers.update();
    } else {
        //清空渲染结果
        scene.renderer.clear();
        //主场景渲染
        scene.renderer.render(scene, scene.camera);
    }

    //渲染结束的回调
    scene.renderEnd.raiseEvent();
}

class GlobeScene extends Scene {
    // [x: string]: any;
    private shaderFrameCount: Number;

    readonly renderer: WebGLRenderer;
    readonly camera: GlobeCamera;
    readonly screenSpaceCameraController: OrbitControls;
    readonly frameState: FrameStateInterFace;
    readonly preUpdate: Event;
    readonly renderError: Event;
    readonly renderStart: Event;
    readonly renderEnd: Event;
    readonly lightCollection: LightCollection;

    clock: Clock;
    enabledEffect: Boolean;
    requestRenderMode: Boolean;
    _renderRequested: Boolean;
    rethrowRenderErrors: Boolean;

    constructor(container: any, options: SceneOptions) {
        super();

        let renderState = defaultValue(options.renderState, {});
        renderState.antialias = defaultValue(renderState.antialias, true);

        this.shaderFrameCount = 0.0;
        this.clock = new Clock();
        this.destroyChildren = true;

        //渲染器
        this.renderer = new GlobeWebGLRenderer(container, renderState);

        bufferSize.set(container.clientWidth, container.clientHeight);

        //初始化相机
        this.camera = new GlobeCamera({
            scene: this,
            fov: 60,
            aspect: container.clientWidth / container.clientHeight,
            near: 0.1,
            far: 500000000
        });

        //初始化相机控制器
        let screenSpaceCameraController = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        screenSpaceCameraController.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        screenSpaceCameraController.dampingFactor = 0.05;
        this.screenSpaceCameraController = screenSpaceCameraController;

        let frameState: FrameStateInterFace = {
            frameNumber: 0,
            //最大纹理各向异性
            maxAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
            //分辨率
            pixelRatio: this.renderer.getPixelRatio(),
            //渲染尺寸
            bufferSize: bufferSize
        };

        this.frameState = frameState;

        //是否开始后处理
        this.enabledEffect = defaultValue(options.enabledEffect, false);

        this.rethrowRenderErrors = false;

        //渲染之前的回调
        this.preUpdate = new Event();
        //渲染发生错误时触发
        this.renderError = new Event();
        //渲染开始前触发
        this.renderStart = new Event();
        //渲染结束后触发
        this.renderEnd = new Event();

        //场景灯光集合
        this.lightCollection = new LightCollection();
        this.addObject(this.lightCollection);

        this.requestRenderMode = defaultValue(options.requestRenderMode, false);
        this._renderRequested = true;
    }

    get pixelRatio(): Number {
        return this.renderer.getPixelRatio();
    }

    //窗口尺寸变化时触发
    setSize(canvas: HTMLCanvasElement) {
        this.camera.resize(canvas);
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.getDrawingBufferSize(bufferSize);
        if (this.enabledEffect) {
            // this.effectComposers.setSize(
            //     canvas.clientWidth,
            //     canvas.clientHeight
            // );
        }
    }

    addHDREnvironment(options: ResourceFetchHdrParameters): void {
        var pmremGenerator = new PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        let scene = this;

        Resource.fetchHdr(options).then(texture => {
            scene.environment = pmremGenerator.fromEquirectangular(
                texture
            ).texture;

            texture.dispose();
            pmremGenerator.dispose();
        });
    }

    initializeFrame(): void {
        this.screenSpaceCameraController.update();
        this.camera._updateCameraChanged();
    }

    updateFrameState() {
        let frameState = this.frameState;
        frameState.bufferSize = bufferSize;
        frameState.frameNumber++;
    }

    executeUpdate() {
        let that = this;

        this.updateFrameState();

        this.updateFixedFrame(this.frameState);
        // this.bloomScene.updateFixedFrame(this.bloomScene, this.frameState);
    }

    render(): void {
        //执行渲染之前的回调
        this.preUpdate.raiseEvent(this);

        let shouldRender = !this.requestRenderMode || this._renderRequested;

        if (shouldRender) {
            this.preUpdate.raiseEvent(this);
            tryAndCatchError(this, render);
        }
    }
}

export { GlobeScene };
