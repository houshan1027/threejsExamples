import { Vector2 } from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

class FXAAPass extends ShaderPass {
    constructor(options: { bufferSize: Vector2 }) {
        super(FXAAShader);

        let bufferSize = options.bufferSize;

        let resolution: Vector2 = this.material.uniforms.resolution.value;
        resolution.set(1.0 / bufferSize.width, 1.0 / bufferSize.height);
    }

    update(bufferSize: Vector2): void {
        let resolution: Vector2 = this.material.uniforms.resolution.value;
        resolution.set(1.0 / bufferSize.width, 1.0 / bufferSize.height);
    }
}

export { FXAAPass };
