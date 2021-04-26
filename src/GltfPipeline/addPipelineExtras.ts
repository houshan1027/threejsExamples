import { defined } from '../Core/defined';
import { ForEach } from './ForEach';

/**
 * Adds extras._pipeline to each object that can have extras in the glTF asset.
 * This stage runs before updateVersion and handles both glTF 1.0 and glTF 2.0 assets.
 *
 * @param {Object} gltf A javascript object containing a glTF asset.
 * @returns {Object} The glTF asset with the added pipeline extras.
 *
 * @private
 */
function addPipelineExtras(gltf: any) {
    ForEach.shader(gltf, function(shader: any) {
        addExtras(shader);
    });
    ForEach.buffer(gltf, function(buffer: any) {
        addExtras(buffer);
    });
    ForEach.image(gltf, function(image: any) {
        addExtras(image);
        ForEach.compressedImage(image, function(compressedImage: any) {
            addExtras(compressedImage);
        });
    });

    addExtras(gltf);

    return gltf;
}

function addExtras(object: any) {
    object.extras = defined(object.extras) ? object.extras : {};
    object.extras._pipeline = defined(object.extras._pipeline) ? object.extras._pipeline : {};
}

export default addPipelineExtras;
