import { Object3DCollection } from '../Core/Object3DCollection';
import { Cesium3Dtileset } from './Cesium3Dtileset';
import { CesiumTile } from './CesiumTile';
import { TileBaseCollection } from './TileBaseCollection';

class CesiumEmptyTile extends TileBaseCollection {
    constructor(tileset: Cesium3Dtileset, parent?: Cesium3Dtileset | CesiumEmptyTile | CesiumTile) {
        super();

        this.tileset = tileset;

        //用于指向父节点
        this.parentTile = parent;

        this.childTiles = new Map();
    }

    //添加一个子节点
    addTile(key: String, tile: CesiumTile | CesiumEmptyTile) {
        this.childTiles.set(key, tile);
    }

    //遍历子节点
}

export { CesiumEmptyTile };
