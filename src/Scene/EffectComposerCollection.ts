import {
    RGBAFormat,
    Vector2,
    WebGLMultisampleRenderTarget,
    WebGLRenderer,
    WebGLRenderTarget
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { GlobeScene } from './GlobeScene';
import { GlobeWebGLRenderer } from './GlobeWebGLRenderer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlobeCamera } from './GlobeCamera';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAPass } from './FXAAPass';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader';

function createMSRT(renderer: GlobeWebGLRenderer): any {
    let bufferSize = renderer.drawingBufferSize;

    let MSRT = new WebGLMultisampleRenderTarget(
        bufferSize.width,
        bufferSize.height,
        {
            format: RGBAFormat,
            stencilBuffer: false
        }
    );

    MSRT.texture.encoding = renderer.outputEncoding;
    return MSRT;
}

/**
 * 用于执行后处理效果的集合
 */
class EffectComposerCollection {
    readonly renderer: GlobeWebGLRenderer;
    readonly scene: GlobeScene;
    readonly camera: GlobeCamera;
    readonly fxaaPass: FXAAPass;
    readonly dotScreenPass: ShaderPass;

    mainEffectComposer: EffectComposer;

    constructor(scene: GlobeScene) {
        this.scene = scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;
        this.mainEffectComposer = new EffectComposer(
            this.renderer,
            createMSRT(this.renderer)
        );

        let renderPass: RenderPass = new RenderPass(scene, this.camera);
        this.mainEffectComposer.addPass(renderPass);

        this.fxaaPass = new FXAAPass({
            bufferSize: scene.renderer.drawingBufferSize
        });
        this.mainEffectComposer.addPass(this.fxaaPass);

        const dotScreenPass = new ShaderPass(DotScreenShader);
        dotScreenPass.uniforms['scale'].value = 4;
        this.mainEffectComposer.addPass(dotScreenPass);
        dotScreenPass.enabled = false;
        this.dotScreenPass = dotScreenPass;
    }

    setSize() {
        let bufferSize = this.renderer.drawingBufferSize;
        this.mainEffectComposer.setSize(bufferSize.width, bufferSize.height);
        this.fxaaPass.update(bufferSize);
    }

    render() {
        this.mainEffectComposer.render();
    }
}

export { EffectComposerCollection };
