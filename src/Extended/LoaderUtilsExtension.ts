import { defined } from '../Core/defined';
import { DeveloperError } from '../Core/DeveloperError';
import { LoaderUtils } from 'three';
import URI from '../ThirdParty/Uri';

declare module 'three/src/loaders/loaderUtils' {
    export interface LoaderUtils {
        getFilenameFromUrl: any;
    }
}

//根据url获取路径的文件名
LoaderUtils.getFilenameFromUrl = function(url: string): any {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(url)) {
        throw new DeveloperError('url is required.');
    }
    //>>includeEnd('debug');

    let uriObject = new URI(url);
    uriObject.normalize();
    let path: string = uriObject.path;
    let index: number = path.lastIndexOf('/');
    if (index !== -1) {
        path = path.substr(index + 1);
    }
    return path;
};

export { LoaderUtils };
