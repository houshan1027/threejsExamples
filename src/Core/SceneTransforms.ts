import { GlobeScene } from '../Scene/GlobeScene';
import { Vector2 } from 'three';

let SceneTransforms = {
    transformWindowToDrawingBuffer: function(
        scene: GlobeScene,
        windowPosition: Vector2,
        result: Vector2
    ) {
        let pixelRatio: number = scene.pixelRatio;
        let xScale = scene.drawingBufferSize.width / pixelRatio;
        let yScale = scene.drawingBufferSize.height / pixelRatio;

        result.set(windowPosition.x * xScale, windowPosition.y * yScale);

        return result;
    }
};

export { SceneTransforms };
