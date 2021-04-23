import { GlobeScene } from '../Scene/GlobeScene';
import { Matrix4, Vector2, Vector3, Vector4 } from 'three';
import { defined } from './defined';

let scratchNDC = new Vector4();
let scratchWorldCoords = new Vector4();
let viewport = new Vector4();

let inverseViewProjection = new Matrix4();

let SceneTransforms = {
    transformWindowToDrawingBuffer: function(scene: GlobeScene, windowPosition: Vector2, result: Vector2) {
        let domElement = scene.renderer.domElement;
        let xScale = scene.drawingBufferSize.width / domElement.clientWidth;
        let yScale = scene.drawingBufferSize.height / domElement.clientHeight;

        result.set(windowPosition.x * xScale, windowPosition.y * yScale);

        return result;
    },

    //缓冲区坐标以及深度计算世界坐标
    drawingBufferToWorldPosition(scene: GlobeScene, drawingBufferPosition: Vector2, depth: number, result: Vector3): Vector3 {
        let { context, camera } = scene;

        let { near, far } = scene.camera;

        if (scene.frameState.useLogDepth) {
            let log2Depth: number = depth * Math.log2(far - near + 1.0);
            let depthFromNear = Math.pow(2.0, log2Depth) - 1.0;
            depth = (far * (1.0 - near / (depthFromNear + near))) / (far - near);
        }

        // console.log(depth);

        // let ndc = scratchNDC.copy((Vector4 as any).UNIT_W);
        scene.renderer.getCurrentViewport(viewport);
        // ndc.x = ((drawingBufferPosition.x - viewport.width) / viewport.width) * 2.0 - 1.0;
        // ndc.y = -((drawingBufferPosition.y - viewport.height) / viewport.height) * 2.0 + 1.0;
        // // ndc.z = depth * 2.0 - 1.0;
        // ndc.z = depth;
        // ndc.w = 1.0;

        // camera.updateProjectionMatrix();
        // ndc.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);

        // scratchWorldCoords.copy(ndc);

        // let worldPosition = scratchWorldCoords;
        // let w = worldPosition.w;
        // worldPosition.divideScalar(w);

        let ndc2 = new Vector3();
        ndc2.x = (drawingBufferPosition.x / viewport.width) * 2.0 - 1.0;
        ndc2.y = -(drawingBufferPosition.y / viewport.height) * 2.0 + 1.0;
        ndc2.z = depth;
        // ndc2.z = depth;

        ndc2.unproject(camera);

        if (!defined(result)) {
            result = new Vector3();
        }
        result.set(ndc2.x, ndc2.y, ndc2.z);

        return result;
    }
};

export { SceneTransforms };
