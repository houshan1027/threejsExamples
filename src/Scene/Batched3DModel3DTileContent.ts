import { defaultValue } from '../Core/defaultValue';
import { getStringFromTypedArray } from '../Core/getStringFromTypedArray';
import { RuntimeError } from '../Core/RuntimeError';
import { CesiumEmptyTile } from '../Tmp/CesiumEmptyTile';
import { EventDispatcher, Loader, Matrix4 } from 'three';
import { Cesium3Dtileset } from '../Tmp/Cesium3Dtileset';
import { CesiumTile } from '../Tmp/CesiumTile';
import { Model } from './Model';
import { Object3DCollection } from '../Core/Object3DCollection';

//用于解析B3DM数据
class Batched3DModel3DTileContent extends Object3DCollection {
    _tileset: Cesium3Dtileset;
    _tile: any;
    _model: Model;
    _resource: Loader;
    _rtcCenterTransform: any;
    _contentModelMatrix: any;

    constructor(tileset: Cesium3Dtileset, tile: CesiumTile, resource: Loader, arrayBuffer: any, byteOffset: number) {
        super();

        //保存主tileset
        this._tileset = tileset;

        //挂载当前tile
        this._tile = tile;

        this._resource = resource;
        this._model = new Model();
        this.addObject(this._model);
        this._rtcCenterTransform = undefined;
        this._contentModelMatrix = undefined;

        initialize(this, arrayBuffer, byteOffset);
    }

    get readyPromise() {
        return this._model.readyPromise;
    }
}

function initialize(content: Batched3DModel3DTileContent, arrayBuffer: ArrayBuffer, byteOffset: number) {
    let tileset = content._tileset;
    let tile = content._tile;
    let resource = content._resource;

    const dataView = new DataView(arrayBuffer);

    // 28-byte header

    // 4 bytes
    const magic =
        String.fromCharCode(dataView.getUint8(0)) +
        String.fromCharCode(dataView.getUint8(1)) +
        String.fromCharCode(dataView.getUint8(2)) +
        String.fromCharCode(dataView.getUint8(3));

    console.assert(magic === 'b3dm');

    // 4 bytes
    const version = dataView.getUint32(4, true);

    console.assert(version === 1);

    // 4 bytes
    const byteLength = dataView.getUint32(8, true);

    console.assert(byteLength === arrayBuffer.byteLength);

    // 4 bytes
    const featureTableJSONByteLength = dataView.getUint32(12, true);

    // 4 bytes
    const featureTableBinaryByteLength = dataView.getUint32(16, true);

    // 4 bytes
    const batchTableJSONByteLength = dataView.getUint32(20, true);

    // 4 bytes
    const batchTableBinaryByteLength = dataView.getUint32(24, true);

    // Feature Table
    const featureTableStart = 28;
    const featureTableBuffer = arrayBuffer.slice(featureTableStart, featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength);
    // const featureTable = new FeatureTable(featureTableBuffer, 0, featureTableJSONByteLength, featureTableBinaryByteLength);

    // Batch Table
    const batchTableStart = featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength;
    const batchTableBuffer = arrayBuffer.slice(batchTableStart, batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength);
    // const batchTable = new BatchTable(batchTableBuffer, featureTable.getData('BATCH_LENGTH'), 0, batchTableJSONByteLength, batchTableBinaryByteLength);

    const glbStart = batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength;
    const glbBytes = new Uint8Array(arrayBuffer, glbStart, byteLength - glbStart);

    const gltfBuffer = glbBytes.slice().buffer;

    // let model = new Model({
    //     gltf: gltfBuffer
    // });

    content._model.loadArraybuffer(gltfBuffer);

    // content._contentModelMatrix = new Matrix4().multiplyMatrices(tile.computedTransform, content._rtcCenterTransform);
}

export { Batched3DModel3DTileContent };
