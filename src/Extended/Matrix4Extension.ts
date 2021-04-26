import { defined } from '../Core/defined';
import { Matrix3, Matrix4 } from 'three';

declare module 'three/src/math/Matrix4' {
    export interface Matrix4 {
        multiplyStatic: Function;
        unpack: Function;
    }
}

(Matrix4 as any).unpack = function(array: number[] | ArrayLike<number>, startingIndex = 0, result = new Matrix4()) {
    return result.fromArray(array, startingIndex);
};

(Matrix4 as any).multiply = function(left: Matrix4, right: Matrix4, result?: Matrix4) {
    if (!defined(result)) {
        result = new Matrix4();
    }

    return result.multiplyMatrices(left, right);
};

(Matrix4 as any).getRotation = function(matrix: Matrix4, result: Matrix3) {
    let resultEle = result.elements;
    let matrixEle = matrix.elements;

    resultEle[0] = matrixEle[0];
    resultEle[1] = matrixEle[1];
    resultEle[2] = matrixEle[2];
    resultEle[3] = matrixEle[4];
    resultEle[4] = matrixEle[5];
    resultEle[5] = matrixEle[6];
    resultEle[6] = matrixEle[8];
    resultEle[7] = matrixEle[9];
    resultEle[8] = matrixEle[10];
    return result;
};

export { Matrix4 };
