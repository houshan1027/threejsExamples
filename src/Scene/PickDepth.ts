import { FrontSide, MeshDepthMaterial, Object3D, PerspectiveCamera, RGBADepthPacking, Scene, WebGLRenderTarget } from 'three';
import { Context } from './Context';
import { GlobeCamera } from './GlobeCamera';

class PickDepth {
    renderTarget: WebGLRenderTarget;
    depthMaterial: MeshDepthMaterial;
    pickScene: Scene;
    pickCamera: PerspectiveCamera;
    constructor() {
        //由于拾取的是一个像素的颜色，因此这里的尺寸也为1*1
        this.renderTarget = new WebGLRenderTarget(1, 1);

        this.depthMaterial = new MeshDepthMaterial({
            side: FrontSide
        });

        //更新场景获取深度是的scene
        this.pickScene = new Scene();

        //更新场景用到的相机
        this.pickCamera = undefined;
    }

    updateCamera(): void {}

    //获取深度
    getDepth(scene: Scene, camera: GlobeCamera, context: Context): void {
        context.updateCamera(camera);
        context.updateScene(scene);

        context.updateRenderTarget();
    }
}

export { PickDepth };
