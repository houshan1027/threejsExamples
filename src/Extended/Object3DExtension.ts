import { defined } from '../Core/defined';
import { Object3D } from 'three';

import { DeveloperError } from '../Core/DeveloperError';
import { Object3DCollection } from '../Core/Object3DCollection';
import { destroyObject } from '../Core/destroyObject';
import { FrameStateInterFace } from '../Scene/GlobeScene';

declare module 'three/src/core/Object3D' {
    export interface Object3D {
        _collection: any;
        destroyChildren: Boolean;

        updateFixedFrame(frameState: FrameStateInterFace): void;
        addObject(object: Object3D): Object3D;
        removeObject(object: Object3D, isDestroy?: Boolean): any;
        isDestroyed(): Boolean;
        destroy(): any;
        destroySelf(): void;
        allowPicking: Boolean;
    }
}

Object3D.prototype.allowPicking = true;

//每帧更新函数
Object3D.prototype.updateFixedFrame = function(
    frameState: FrameStateInterFace
) {
    let children = this.children;

    for (let i = 0, len = children.length; i < len; i++) {
        let object = children[i];
        if (defined(object.updateFixedFrame)) {
            object.updateFixedFrame(frameState);
        }
    }
};

Object3D.prototype.addObject = function(object: Object3D) {
    if (object.isDestroyed()) {
        throw new DeveloperError('This object was destroyed');
    }

    this.add(object);
    object._collection = this;
    return object;
};

Object3D.prototype.removeObject = function(
    object: Object3DCollection | Object3D,
    isDestroy = false
) {
    this.remove(object);

    if (this.destroyChildren || isDestroy) {
        object.destroy();
    }

    return object;
};

/**
 * 移除自身的geometry以及Material，并将其从内存中卸载
 */
(Object3D as any).prototype.destroySelf = function() {
    if (defined(this.geometry)) {
        this.geometry.dispose();
        this.geometry = null;
    }

    let material = this.material;

    if (defined(material)) {
        if (defined(material.map)) {
            material.map.dispose();
            material.map = null;
        }

        if (defined(material.aoMap)) {
            material.aoMap.dispose();
            material.aoMap = null;
        }

        if (defined(material.lightMap)) {
            material.lightMap.dispose();
            material.lightMap = null;
        }

        material.dispose();
        material = null;
    }
};

//卸载该对象
Object3D.prototype.destroy = function(): any {
    this.destroySelf();

    this.traverse((node: any) => {
        if (node.isMesh || node.isSprite) {
            node.destroySelf();
        }
    });

    return destroyObject(this);
};

Object3D.prototype.isDestroyed = function() {
    return false;
};

export { Object3D };
