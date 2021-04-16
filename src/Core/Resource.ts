import {
    MathUtils,
    TextureDataType,
    Texture,
    TextureLoader,
    UnsignedByteType
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Check } from './Check';
import { defaultValue } from './defaultValue';
import { LoaderUtils } from '../Extended/LoaderUtilsExtension';

export interface ResourceFetchHdrParameters {
    url: string;
    dataType?: TextureDataType;
}

let Resource = {
    fetchImage(options: { url: string }): Promise<Texture> {
        return new TextureLoader().loadAsync(options.url);
    },

    fetchHdr(options: ResourceFetchHdrParameters): Promise<Texture> {
        let url = options.url;
        Check.defined(options.url, 'options.url');

        let dataType = defaultValue(options.dataType, UnsignedByteType);

        let basePath = LoaderUtils.extractUrlBase(url);
        let fileName = LoaderUtils.getFilenameFromUrl(url);

        return new RGBELoader()
            .setDataType(dataType)
            .setPath(basePath)
            .loadAsync(fileName);
    }
};

export { Resource };
