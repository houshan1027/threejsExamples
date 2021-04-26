import { defined } from '../Core/defined';
import { DeveloperError } from '../Core/DeveloperError';
import { LoaderUtils } from 'three';
import URI from '../ThirdParty/Uri';

declare module 'three/src/loaders/loaderUtils' {
    export interface LoaderUtils {
        getFilenameFromUrl: Function;
        isCrossOriginUrl: Function;
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

let a: any;
LoaderUtils.isCrossOriginUrl = function(url: string) {
    if (!defined(a)) {
        a = document.createElement('a');
    }

    // copy window location into the anchor to get consistent results
    // when the port is default for the protocol (e.g. 80 for HTTP)
    a.href = window.location.href;

    // host includes both hostname and port if the port is not standard
    var host = a.host;
    var protocol = a.protocol;

    a.href = url;
    // IE only absolutizes href on get, not set
    a.href = a.href; // eslint-disable-line no-self-assign

    return protocol !== a.protocol || host !== a.host;
};

export { LoaderUtils };
