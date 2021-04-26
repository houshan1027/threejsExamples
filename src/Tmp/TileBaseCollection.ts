import { Object3DCollection } from '../Core/Object3DCollection';
import { Cesium3Dtileset } from './Cesium3Dtileset';
import { CesiumEmptyTile } from './CesiumEmptyTile';
import { CesiumTile } from './CesiumTile';

class TileBaseCollection extends Object3DCollection {
    parentTile?: Cesium3Dtileset | CesiumEmptyTile | CesiumTile;
    tileset?: Cesium3Dtileset;
    childTiles: Map<String, CesiumEmptyTile | CesiumTile>;
    constructor() {
        super();

        this.tileset = undefined;
        this.parentTile = undefined;

        //用于保存子节点
        this.childTiles = new Map();
    }

    //遍历子节点
    traversalChildTile(callback: Function) {
        callback(this);

        for (let value of this.childTiles.values()) {
            value.traversalChildTile(callback);
        }
    }
}

export { TileBaseCollection };
