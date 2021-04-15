import { Vector2 } from 'three';

interface FrameState {
    //帧数的累计
    frameNumber: any;
    //最大纹理各向异性
    maxAnisotropy: Number;
    //分辨率
    pixelRatio: Number;
    //渲染尺寸
    bufferSize: Vector2;
}

export { FrameState };
