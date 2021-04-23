import { defined } from '../Core/defined';
import { PerspectiveCamera, RGBADepthPacking, Scene, Vector2, Vector3 } from 'three';
import { GlobeScene } from './GlobeScene';
import { DeveloperError } from '../Core/DeveloperError';
import { SceneTransforms } from '../Core/SceneTransforms';
import { Context } from './Context';
import { Vector4 } from '../Extended/Vector4Extension';
import { Check } from '../Core/Check';
import { PickDepth } from './PickDepth';

var scratchPosition = new Vector2();
var scratchColorZero = new Vector4(0.0, 0.0, 0.0, 0.0);

var scratchPackedDepth = new Vector4();

// const UnpackDownscale = 255 / 256;
// var UnpackFactors = new Vector4((UnpackDownscale / 256) * 256 * 256, (UnpackDownscale / 256) * 256, UnpackDownscale / 256, UnpackDownscale / 255 / 256);
const UnpackDownscale = 255 / 256;
let PackFactors = new Vector3(256 * 256 * 256, 256 * 256, 256);
// const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
let UnpackFactors = new Vector4();
UnpackFactors.x = UnpackDownscale / PackFactors.x;
UnpackFactors.y = UnpackDownscale / PackFactors.y;
UnpackFactors.z = UnpackDownscale / PackFactors.z;
UnpackFactors.w = UnpackDownscale / 1;
class Picking {
    scene: GlobeScene;
    pickDepth: PickDepth;
    constructor(scene: GlobeScene) {
        //保存主场景
        this.scene = scene;

        //用于计算深度
        this.pickDepth = new PickDepth(scene);
    }

    //根据depthTexture获取深度
    getDepth(scene: GlobeScene, x: number, y: number) {
        let pixels = this.pickDepth.getDepth(scene, x, y);

        if (this.pickDepth.depthMaterial.depthPacking === RGBADepthPacking) {
            let packedDepth = (Vector4 as any).unpack(pixels, 0, scratchPackedDepth);
            return packedDepth.dot(UnpackFactors) * 2 - 1;
        }

        return -pixels[0] * 2.0 + 1.0;
    }

    pickPositionWorldCoordinates(scene: GlobeScene, windowPosition: Vector2, result: Vector3): Vector3 {
        if (!scene.useDepthPicking) {
            return;
        }

        //>>includeStart('debug', pragmas.debug);
        if (!defined(windowPosition)) {
            throw new DeveloperError('windowPosition is undefined.');
        }
        //>>includeEnd('debug');

        var drawingBufferPosition = SceneTransforms.transformWindowToDrawingBuffer(scene, windowPosition, scratchPosition);

        let depth: number = this.getDepth(scene, drawingBufferPosition.x, drawingBufferPosition.y);

        return SceneTransforms.drawingBufferToWorldPosition(scene, drawingBufferPosition, depth, result);
    }

    pickPosition(scene: GlobeScene, windowPosition: Vector2, result: Vector3) {
        return this.pickPositionWorldCoordinates(scene, windowPosition, result);
    }
}
export { Picking };

export interface unpackF {}
