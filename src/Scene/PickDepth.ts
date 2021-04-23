import { FloatType, FrontSide, LinearFilter, MeshDepthMaterial, NearestFilter, Object3D, PerspectiveCamera, RGBADepthPacking, RGBAFormat, Scene, WebGLRenderTarget } from 'three';
import { Context } from './Context';
import { GlobeCamera } from './GlobeCamera';
import { GlobeScene } from './GlobeScene';

class PickDepth {
    renderTarget: WebGLRenderTarget;
    depthMaterial: MeshDepthMaterial;
    pickScene: Scene;
    pickCamera: PerspectiveCamera;
    constructor(scene: GlobeScene) {
        //由于拾取的是一个像素的颜色，因此这里的尺寸也为1*1

        let bufferSize = scene.drawingBufferSize;

        this.renderTarget = new WebGLRenderTarget(bufferSize.width, bufferSize.height, {
            minFilter: LinearFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: FloatType
        });

        this.renderTarget.texture.minFilter = NearestFilter;
        this.renderTarget.texture.magFilter = NearestFilter;
        this.renderTarget.texture.generateMipmaps = false;

        this.depthMaterial = new MeshDepthMaterial({
            side: FrontSide,
            depthPacking: RGBADepthPacking
        });

        //更新场景获取深度是的scene
        this.pickScene = new Scene();

        //更新场景用到的相机
        this.pickCamera = new PerspectiveCamera();
    }

    updateCamera(): void {}

    //获取深度
    getDepth(scene: GlobeScene, x: number, y: number): any {
        let context = scene.context;
        let bufferSize = scene.drawingBufferSize;

        let pickScene = this.pickScene;
        this.pickCamera = this.pickCamera.copy(scene.camera, true);

        pickScene.overrideMaterial = this.depthMaterial;

        pickScene.children = [].concat(scene.children);
        scene.children = [];

        let pixels = context.readPixels({
            x: x,
            y: bufferSize.height - y,
            width: 1,
            height: 1,
            renderTarget: this.renderTarget,
            scene: pickScene,
            camera: this.pickCamera
        });

        scene.children = [].concat(pickScene.children);
        pickScene.children = [];

        return pixels;
    }
}

export { PickDepth };
