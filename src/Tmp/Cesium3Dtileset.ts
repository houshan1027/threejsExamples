import { Resource } from '../Core/Resource';
import { defaultValue } from '../Core/defaultValue';
import { defined } from '../Core/defined';
import { Object3DCollection } from '../Core/Object3DCollection';
import { CesiumEmptyTile } from './CesiumEmptyTile';
import { CesiumTile } from './CesiumTile';
import { RuntimeError } from '../Core/RuntimeError';
import { Cesium3DTilesetStatistics } from './Cesium3DTilesetStatistics';
import { Cesium3DTileRefine } from './Cesium3DTileRefine';

interface Cesium3DtilesetParameters {
    url: string;
    maximumScreenSpaceError?: number;
    maximumMemoryUsage?: number;
}

class Cesium3Dtileset extends Object3DCollection {
    readonly resource: Resource;
    private selectedTiles: Array<CesiumTile>;
    _statistics: Cesium3DTilesetStatistics;

    _root: any;

    _url: string;
    _basePath: string;
    _asset: any;
    _emptyTiles: Array<any>;
    _requestedTiles: Array<any>;
    _maximumScreenSpaceError: number;
    _maximumMemoryUsage: number;
    _allTilesAdditive: boolean;

    constructor(options: Cesium3DtilesetParameters) {
        super();

        //用于保存json文件的内容
        this._asset = undefined;

        //根结点，不挂载任何实体，索引保存在这里
        this._root = new CesiumEmptyTile(this, this);

        this._statistics = new Cesium3DTilesetStatistics();

        //真正渲染到场景中的tile数组
        this.selectedTiles = [];
        this._emptyTiles = [];
        this._requestedTiles = [];

        //SSE阈值
        this._maximumScreenSpaceError = defaultValue(options.maximumScreenSpaceError, 16);
        //最大显存使用量
        this._maximumMemoryUsage = defaultValue(options.maximumMemoryUsage, 512);

        this._allTilesAdditive = true;

        let url = options.url;
        this._url = url;

        if (defined(url)) {
            let basePath: string | '';
            let resource = new Resource({ url });

            if (resource.extension === 'json') {
                basePath = resource.getBaseUri();
            }
            this._basePath = basePath;

            resource.fetchJson().then(tilesetJson => {
                this._root = this.loadTileset(resource, tilesetJson);
            });
        }
    }

    get root() {
        return this._root;
    }

    loadTileset(resource: Resource, tilesetJson: any, parentTile?: any) {
        let asset = tilesetJson.asset;

        if (!defined(asset)) {
            throw new RuntimeError('Tileset must have an asset property.');
        }
        if (asset.version !== '0.0' && asset.version !== '1.0') {
            throw new RuntimeError('The tileset must be 3D Tiles version 0.0 or 1.0.');
        }

        let statistics: Cesium3DTilesetStatistics = this._statistics;

        let rootTile = new CesiumTile(this, resource, tilesetJson.root, parentTile);

        if (defined(parentTile)) {
            parentTile.children.push(rootTile);
            rootTile._depth = parentTile._depth + 1;
        }

        var stack = [];
        stack.push(rootTile);

        while (stack.length > 0) {
            let tile: any = stack.pop();
            ++statistics.numberOfTilesTotal;
            this._allTilesAdditive = this._allTilesAdditive && tile.refine === Cesium3DTileRefine.ADD;
            var children = tile._header.children;
            if (defined(children)) {
                var length = children.length;
                for (var i = 0; i < length; ++i) {
                    var childHeader = children[i];
                    var childTile = new CesiumTile(this, resource, childHeader, tile);
                    tile.children.push(childTile);
                    childTile._depth = tile._depth + 1;
                    stack.push(childTile);
                }
            }

            // if (this._cullWithChildrenBounds) {
            //     Cesium3DTileOptimizations.checkChildrenWithinParent(tile);
            // }
        }
    }

    //添加子节点
    addTile(key: String, tile: CesiumTile | CesiumEmptyTile) {
        this.root.addTile(key, tile);
    }

    selectTile(tile: CesiumTile) {
        let content = tile.content;
        for (let value of content.values()) {
            // console.log(value);
            this.addObject(value);
        }
    }

    //执行遍历
    executeTraversal() {
        let tileset = this;
        this.root.traversalChildTile((obj: any) => {
            let content = obj.content;
            if (!defined(content) || !obj.visible) {
                return;
            }

            tileset.selectTile(obj);
        });
    }

    update() {
        // this.executeTraversal();
    }

    updateFixedFrame() {
        //清空渲染队列
        this.clear();

        this.update();
    }
}

export { Cesium3Dtileset };
