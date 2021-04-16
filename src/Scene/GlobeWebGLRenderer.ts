import { defaultValue } from '../Core/defaultValue';
import {
    LinearToneMapping,
    sRGBEncoding,
    WebGLRenderer,
    WebGLRendererParameters
} from 'three';

class GlobeWebGLRenderer extends WebGLRenderer {
    constructor(container: any, options: WebGLRendererParameters) {
        super(options);

        let { clientWidth, clientHeight } = container;

        this.setSize(clientWidth, clientHeight);
        this.setViewport(0, 0, clientWidth, clientHeight);
        this.autoClear = false;
        this.toneMapping = LinearToneMapping;
        this.toneMappingExposure = 1.0;
        this.outputEncoding = sRGBEncoding;

        container.appendChild(this.domElement);
    }
}

export { GlobeWebGLRenderer };
