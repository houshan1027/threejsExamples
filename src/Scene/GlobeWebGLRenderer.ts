import { defaultValue } from '../Core/defaultValue';
import { LinearToneMapping, sRGBEncoding, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';

//用于保存当前绘图缓冲区的宽高
let drawingBufferSize = new Vector2();

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
        this.setClearColor(0xa748c4);

        container.appendChild(this.domElement);
    }

    get drawingBufferSize(): Vector2 {
        return this.getDrawingBufferSize(drawingBufferSize);
    }
}

export { GlobeWebGLRenderer };
