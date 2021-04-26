import { Vector3, Matrix3 } from 'three';

(Matrix3 as any).getColumn = function(matrix: Matrix3, index: number, result: Vector3) {
    var startIndex = index * 3;
    var x = matrix.elements[startIndex];
    var y = matrix.elements[startIndex + 1];
    var z = matrix.elements[startIndex + 2];

    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};

export { Matrix3 };
