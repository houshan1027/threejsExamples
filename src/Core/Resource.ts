import { MathUtils, TextureDataType, Texture, TextureLoader, UnsignedByteType, FileLoader, Loader } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Check } from './Check';
import { defaultValue } from './defaultValue';
import { LoaderUtils } from '../Extended/LoaderUtilsExtension';
import { defined } from './defined';
import { clone } from './clone';
import URI from '../ThirdParty/Uri';
import queryToObject from './queryToObject';
import { isDataUri } from './isDataUri';
import Request from './Request';
import { combine } from './combine';
import { RequestState } from './RequestState';
import { RuntimeError } from './RuntimeError';
import { objectToQuery } from './objectToQuery';
import { getExtensionFromUri } from './getExtensionFromUri';

export interface ResourceFetchHdrParameters {
    url: string;
    dataType?: TextureDataType;
}

var xhrBlobSupported = (function() {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '#', true);
        xhr.responseType = 'blob';
        return xhr.responseType === 'blob';
    } catch (e) {
        return false;
    }
})();

/**
 * A resource that includes the location and any other parameters we need to retrieve it or create derived resources. It also provides the ability to retry requests.
 *
 * @alias Resource
 * @constructor
 *
 * @param {String|Object} options A url or an object with the following properties
 * @param {String} options.url The url of the resource.
 * @param {Object} [options.queryParameters] An object containing query parameters that will be sent when retrieving the resource.
 * @param {Object} [options.templateValues] Key/Value pairs that are used to replace template values (eg. {x}).
 * @param {Object} [options.headers={}] Additional HTTP headers that will be sent.
 * @param {DefaultProxy} [options.proxy] A proxy to be used when loading the resource.
 * @param {Resource~RetryCallback} [options.retryCallback] The Function to call when a request for this resource fails. If it returns true, the request will be retried.
 * @param {Number} [options.retryAttempts=0] The number of times the retryCallback should be called before giving up.
 * @param {Request} [options.request] A Request object that will be used. Intended for internal use only.
 *
 * @example
 * function refreshTokenRetryCallback(resource, error) {
 *   if (error.statusCode === 403) {
 *     // 403 status code means a new token should be generated
 *     return getNewAccessToken()
 *       .then(function(token) {
 *         resource.queryParameters.access_token = token;
 *         return true;
 *       })
 *       .otherwise(function() {
 *         return false;
 *       });
 *   }
 *
 *   return false;
 * }
 *
 * var resource = new Resource({
 *    url: 'http://server.com/path/to/resource.json',
 *    proxy: new DefaultProxy('/proxy/'),
 *    headers: {
 *      'X-My-Header': 'valueOfHeader'
 *    },
 *    queryParameters: {
 *      'access_token': '123-435-456-000'
 *    },
 *    retryCallback: refreshTokenRetryCallback,
 *    retryAttempts: 1
 * });
 */

class Resource {
    private _url: string;
    loader: any;
    _readyPromise: any;

    constructor(
        options: {
            url: string;
        },
        manager?: any
    ) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        if (typeof options === 'string') {
            options = {
                url: options
            };
        }

        this._url = undefined;

        var uri = new URI(options.url);

        // Remove the fragment as it's not sent with a request
        uri.fragment = undefined;

        this._url = uri.toString();

        this.loader = undefined;

        this._readyPromise = undefined;
    }

    get readyPromise() {
        return this._readyPromise;
    }

    static get isBlobSupported() {
        return xhrBlobSupported;
    }

    /**
     * The file extension of the resource.
     *
     * @memberof Resource.prototype
     * @type {String}
     *
     * @readonly
     */
    get extension() {
        return getExtensionFromUri(this._url);
    }

    /**
     * True if the Resource refers to a data URI.
     *
     * @memberof Resource.prototype
     * @type {Boolean}
     */
    get isDataUri() {
        return isDataUri(this._url);
    }

    /**
     * True if the Resource refers to a cross origin URL.
     *
     * @memberof Resource.prototype
     * @type {Boolean}
     */
    get isCrossOriginUrl() {
        return LoaderUtils.isCrossOriginUrl(this._url);
    }

    fetchJson() {
        return (this._readyPromise = new FileLoader().loadAsync(this._url).then((res: any) => {
            return JSON.parse(res);
        }));
    }

    getBaseUri() {
        return LoaderUtils.extractUrlBase(this._url);
    }

    static fetchJson(options: { url: string }) {
        let resource = new Resource({ url: options.url });
        return (resource._readyPromise = new FileLoader().loadAsync(resource._url).then((res: any) => {
            return JSON.parse(res);
        }));
    }

    static fetchImage(options: { url: string }): Promise<Texture> {
        return new TextureLoader().loadAsync(options.url);
    }

    static fetchHdr(options: ResourceFetchHdrParameters): Promise<Texture> {
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

    static fetchArrayBuffer(options: { url: string }) {
        let url = options.url;

        let fileLoader = new FileLoader();
        fileLoader.setResponseType('arraybuffer');

        return fileLoader.loadAsync(url);
    }
}

export { Resource };
