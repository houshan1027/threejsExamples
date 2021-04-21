import { defined } from '../Core/defined';
import { Vector2, Vector3 } from 'three';
import { GlobeScene } from './GlobeScene';
import { DeveloperError } from '../Core/DeveloperError';
import { SceneTransforms } from '../Core/SceneTransforms';
import { Context } from './Context';
import { Vector4 } from '../Extended/Vector4Extension';
import { Check } from '../Core/Check';

var scratchPosition = new Vector2();
var scratchColorZero = new Vector4(0.0, 0.0, 0.0, 0.0);

var scratchPackedDepth = new Vector4();

const UnpackDownscale = 255 / 256;
var UnpackFactors = new Vector4((UnpackDownscale / 256) * 256 * 256, (UnpackDownscale / 256) * 256, UnpackDownscale / 256, UnpackDownscale / 255 / 256);

class Picking {
    constructor() {}

    //根据depthTexture获取深度
    getDepth(context: Context, x: Number, y: Number) {
        let pixels = context.readPixels({
            x: x,
            y: y,
            width: 1,
            height: 1
        });

        let packedDepth = (Vector4 as any).unpack(pixels, 0, scratchPackedDepth);

        // packedDepth.divideScalar(255);

        return packedDepth.dot(UnpackFactors);
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
        // drawingBufferPosition.y = scene.drawingBufferSize.height - drawingBufferPosition.y;

        let depth: number = this.getDepth(scene.context, drawingBufferPosition.x, drawingBufferPosition.y);

        return SceneTransforms.drawingBufferToWorldPosition(scene, drawingBufferPosition, depth, result);
    }

    pickPosition(scene: GlobeScene, windowPosition: Vector2, result: Vector3) {
        return this.pickPositionWorldCoordinates(scene, windowPosition, result);
    }
}
export { Picking };

export interface unpackF {}
