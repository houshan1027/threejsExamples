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
var packedDepthScale = new Vector4(
    1.0,
    1.0 / 255.0,
    1.0 / 65025.0,
    1.0 / 16581375.0
);

let unpack = function(array: any, startingIndex: number, result: any): Vector4 {
    Check.defined('array', array);

    if (!defined(result)) {
        result = new Vector4();
    }
    result.x = array[startingIndex++];
    result.y = array[startingIndex++];
    result.z = array[startingIndex++];
    result.w = array[startingIndex];
    return result;
};

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

        //方法01
        // let packedDepth = (Vector4 as any).unpack(pixels, 0, scratchPackedDepth);
        //方法02

        let packedDepth = (Vector4 as any).unpack(
            pixels,
            0,
            scratchPackedDepth
        );

        packedDepth.divideScalar(255);
        return packedDepth.dot(packedDepthScale);
    }

    pickPositionWorldCoordinates(
        scene: GlobeScene,
        windowPosition: Vector2,
        result: Vector3
    ): Vector3 {
        if (!scene.useDepthPicking) {
            return;
        }

        //>>includeStart('debug', pragmas.debug);
        if (!defined(windowPosition)) {
            throw new DeveloperError('windowPosition is undefined.');
        }
        //>>includeEnd('debug');

        var drawingBufferPosition = SceneTransforms.transformWindowToDrawingBuffer(
            scene,
            windowPosition,
            scratchPosition
        );
        drawingBufferPosition.y =
            scene.drawingBufferSize.height - drawingBufferPosition.y;

        let depth: number = this.getDepth(
            scene.context,
            drawingBufferPosition.x,
            drawingBufferPosition.y
        );

        return SceneTransforms.drawingBufferToWorldPosition(
            scene,
            drawingBufferPosition,
            depth,
            result
        );
    }

    pickPosition(scene: GlobeScene, windowPosition: Vector2, result: Vector3) {
        return this.pickPositionWorldCoordinates(scene, windowPosition, result);
    }
}
export { Picking };

export interface unpackF {}
