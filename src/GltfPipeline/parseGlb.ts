import { defined } from '../Core/defined';
import { getMagic } from './getMagic';
import { getStringFromTypedArray } from '../Core/getStringFromTypedArray';
import { RuntimeError } from '../Core/RuntimeError';
import addPipelineExtras from './addPipelineExtras';

var sizeOfUint32 = 4;

function parseGlb(glb: any) {
    var magic = getMagic(glb);
    if (magic !== 'glTF') {
        throw new RuntimeError('File is not valid binary glTF');
    }

    var header = readHeader(glb, 0, 5);
    var version = header[1];
    if (version !== 1 && version !== 2) {
        throw new RuntimeError('Binary glTF version is not 1 or 2');
    }

    if (version === 1) {
        // return parseGlbVersion1(glb, header);
    }

    return parseGlbVersion2(glb, header);
}

function readHeader(glb: any, byteOffset: number, count: number) {
    var dataView = new DataView(glb.buffer);
    var header = new Array(count);
    for (var i = 0; i < count; ++i) {
        header[i] = dataView.getUint32(glb.byteOffset + byteOffset + i * sizeOfUint32, true);
    }
    return header;
}

function parseGlbVersion2(glb: any, header: any) {
    var length = header[2];
    var byteOffset = 12;
    var gltf;
    var binaryBuffer;
    while (byteOffset < length) {
        var chunkHeader = readHeader(glb, byteOffset, 2);
        var chunkLength = chunkHeader[0];
        var chunkType = chunkHeader[1];
        byteOffset += 8;
        var chunkBuffer = glb.subarray(byteOffset, byteOffset + chunkLength);
        byteOffset += chunkLength;
        // Load JSON chunk
        if (chunkType === 0x4e4f534a) {
            var jsonString = getStringFromTypedArray(chunkBuffer);
            gltf = JSON.parse(jsonString);
            addPipelineExtras(gltf);
        }
        // Load Binary chunk
        else if (chunkType === 0x004e4942) {
            binaryBuffer = chunkBuffer;
        }
    }
    if (defined(gltf) && defined(binaryBuffer)) {
        var buffers = gltf.buffers;
        if (defined(buffers) && buffers.length > 0) {
            var buffer = buffers[0];
            buffer.extras._pipeline.source = binaryBuffer;
        }
    }
    return gltf;
}
export { parseGlb };
