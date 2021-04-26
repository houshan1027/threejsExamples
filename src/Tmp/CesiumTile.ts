import { defined } from '../Core/defined';
import { BoxGeometry, Matrix3, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { Object3DCollection } from '../Core/Object3DCollection';
import { Cesium3Dtileset } from './Cesium3Dtileset';
import { CesiumEmptyTile } from './CesiumEmptyTile';
import { TileBaseCollection } from './TileBaseCollection';
import { Matrix4 } from '../Extended/Matrix4Extension';
import { Resource } from '../Core/Resource';
import { RuntimeError } from '../Core/RuntimeError';
import '../Extended/Matrix4Extension';
import { TileOrientedBoundingBox } from '../Scene/TileOrientedBoundingBox';
import { Cesium3DTileRefine } from './Cesium3DTileRefine';
import { deprecationWarning } from '../Core/deprecationWarning';
import { Cesium3DTileContentState } from '../Core/Cesium3DTileContentState';

let scratchMatrix = new Matrix3();
let scratchCenter = new Vector3();
let scratchHalfAxes = new Matrix3();

function createBox(box: Array<number>, transform: Matrix4, result: TileOrientedBoundingBox): TileOrientedBoundingBox {
    let center = scratchCenter.set(box[0], box[1], box[2]);
    var halfAxes = scratchHalfAxes.fromArray(box, 3);
    center = center.applyMatrix4(transform);
    var rotationScale = (Matrix4 as any).getRotation(transform, scratchMatrix);
    // rotationScale.multiply(halfAxes);
    halfAxes.premultiply(rotationScale);

    if (defined(result)) {
        result.update(center, halfAxes);
        return result;
    }
    return new TileOrientedBoundingBox(center, halfAxes);
}

class CesiumTile extends TileBaseCollection {
    content: Map<String, Object3D>;
    comKey: String;
    transform: Matrix4;
    computedTransform: Matrix4;
    _initialTransform: Matrix4;
    _boundingVolume: TileOrientedBoundingBox | void;
    _contentBoundingVolume: any;
    _contentBoundingVolume2D: any;
    _viewerRequestVolume: any;
    geometricError: number;
    refine: number;
    hasEmptyContent: boolean;
    hasTilesetContent: boolean;
    cacheNode: any;
    expireDuration: any;
    clippingPlanesDirty: boolean;
    _distanceToCamera: number;
    _centerZDepth: number;
    _screenSpaceError: number;
    _visibilityPlaneMask: number;
    _visible: boolean;
    _inRequestVolume: boolean;

    _finalResolution: boolean;
    _depth: number;
    _stackLength: number;
    _selectionDepth: number;

    _updatedVisibilityFrame: number;
    _touchedFrame: number;
    _visitedFrame: number;
    _selectedFrame: number;
    _requestedFrame: number;
    _ancestorWithContent: any;
    _ancestorWithContentAvailable: any;
    _refines: boolean;
    _shouldSelect: boolean;
    _priority: number;

    private _header: any;

    constructor(tileset: Cesium3Dtileset, baseResource: Resource, header: any, parent: any) {
        super();

        this.tileset = tileset;

        this._header = header;
        let contentHeader = header.content;

        //用于保存该构件下的所有mesh
        this.content = new Map();

        this.comKey = undefined;

        this.transform = new Matrix4();
        if (defined(header.transform)) {
            this.transform = this.transform.fromArray(header.transform);
        }

        let parentTransform = defined(parent) ? parent.computedTransform : tileset.matrix;
        var computedTransform = new Matrix4().multiplyMatrices(parentTransform, this.transform);

        let parentInitialTransform = defined(parent) ? parent._initialTransform : new Matrix4();
        this._initialTransform = new Matrix4().multiplyMatrices(parentInitialTransform, this.transform);

        /**
         * The final computed transform of this tile.
         * @type {Matrix4}
         * @readonly
         */
        this.computedTransform = computedTransform;

        this._boundingVolume = this.createBoundingVolume(header.boundingVolume, computedTransform);

        var contentBoundingVolume;

        if (defined(contentHeader) && defined(contentHeader.boundingVolume)) {
            // Non-leaf tiles may have a content bounding-volume, which is a tight-fit bounding volume
            // around only the features in the tile.  This box is useful for culling for rendering,
            // but not for culling for traversing the tree since it does not guarantee spatial coherence, i.e.,
            // since it only bounds features in the tile, not the entire tile, children may be
            // outside of this box.
            contentBoundingVolume = this.createBoundingVolume(contentHeader.boundingVolume, computedTransform);
        }

        this._contentBoundingVolume = contentBoundingVolume;
        this._contentBoundingVolume2D = undefined;

        var viewerRequestVolume;
        if (defined(header.viewerRequestVolume)) {
            viewerRequestVolume = this.createBoundingVolume(header.viewerRequestVolume, computedTransform);
        }
        this._viewerRequestVolume = viewerRequestVolume;

        /**
         * The error, in meters, introduced if this tile is rendered and its children are not.
         * This is used to compute screen space error, i.e., the error measured in pixels.
         *
         * @type {Number}
         * @readonly
         */
        this.geometricError = header.geometricError;

        this.refine = Cesium3DTileRefine.REPLACE;

        this.parentTile = parent;

        var content;
        var hasEmptyContent;
        var contentState;
        var contentResource;
        var serverKey;

        if (defined(contentHeader)) {
            var contentHeaderUri = contentHeader.uri;
            if (defined(contentHeader.url)) {
                // Cesium3DTile._deprecationWarning('contentUrl', 'This tileset JSON uses the "content.url" property which has been deprecated. Use "content.uri" instead.');
                // contentHeaderUri = contentHeader.url;
            }
            hasEmptyContent = false;
            contentState = Cesium3DTileContentState.UNLOADED;
            // contentResource = baseResource.getDerivedResource({
            //     url: contentHeaderUri
            // });
            // serverKey = RequestScheduler.getServerKey(contentResource.getUrlComponent());
        } else {
            // content = new Empty3DTileContent(tileset, this);
            // hasEmptyContent = true;
            // contentState = Cesium3DTileContentState.READY;
        }

        /**
         * When <code>true</code>, the tile has no content.
         *
         * @type {Boolean}
         * @readonly
         *
         * @private
         */
        this.hasEmptyContent = hasEmptyContent;

        /**
         * When <code>true</code>, the tile's content points to an external tileset.
         * <p>
         * This is <code>false</code> until the tile's content is loaded.
         * </p>
         *
         * @type {Boolean}
         * @readonly
         *
         * @private
         */
        this.hasTilesetContent = false;

        /**
         * The node in the tileset's LRU cache, used to determine when to unload a tile's content.
         *
         * See {@link Cesium3DTilesetCache}
         *
         * @type {DoublyLinkedListNode}
         * @readonly
         *
         * @private
         */
        this.cacheNode = undefined;

        var expire = header.expire;
        var expireDuration;
        var expireDate;
        if (defined(expire)) {
            expireDuration = expire.duration;
            if (defined(expire.date)) {
                // expireDate = JulianDate.fromIso8601(expire.date);
            }
        }

        /**
         * The time in seconds after the tile's content is ready when the content expires and new content is requested.
         *
         * @type {Number}
         */
        this.expireDuration = expireDuration;

        this.clippingPlanesDirty = false;

        // Members that are updated every frame for tree traversal and rendering optimizations:
        this._distanceToCamera = 0;
        this._centerZDepth = 0;
        this._screenSpaceError = 0;
        this._visibilityPlaneMask = 0;
        this._visible = false;
        this._inRequestVolume = false;

        this._finalResolution = true;
        this._depth = 0;
        this._stackLength = 0;
        this._selectionDepth = 0;

        this._updatedVisibilityFrame = 0;
        this._touchedFrame = 0;
        this._visitedFrame = 0;
        this._selectedFrame = 0;
        this._requestedFrame = 0;
        this._ancestorWithContent = undefined;
        this._ancestorWithContentAvailable = undefined;
        this._refines = false;
        this._shouldSelect = false;
        this._priority = 0.0;
    }

    createBoundingVolume(boundingVolumeHeader: any, transform: Matrix4, result?: TileOrientedBoundingBox): TileOrientedBoundingBox | void {
        if (!defined(boundingVolumeHeader)) {
            throw new RuntimeError('boundingVolume must be defined');
        }
        if (defined(boundingVolumeHeader.box)) {
            return createBox(boundingVolumeHeader.box, transform, result);
        }
    }

    //请求每个瓦片的content
    requestContent() {}

    static _deprecationWarning = deprecationWarning;
}

export { CesiumTile };
