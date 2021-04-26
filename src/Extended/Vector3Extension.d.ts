// declare module 'three/src/math/Vector3' {
//     export interface Vector3 {
//         packedLength: number;
//     }
// }

declare global {
    interface Vector3 {
        packedLength(): number;
    }
}
export {};
