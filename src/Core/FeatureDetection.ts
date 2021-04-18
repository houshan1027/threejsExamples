import { defined } from './defined';

let theNavigator: any;
if (typeof navigator !== 'undefined') {
    theNavigator = navigator;
} else {
    theNavigator = {};
}

function extractVersion(versionString: String): any {
    let parts: any = versionString.split('.');
    for (let i = 0, len = parts.length; i < len; ++i) {
        parts[i] = parseInt(parts[i], 10);
    }
    return parts;
}

var isFirefoxResult: Boolean;
var firefoxVersionResult;
function isFirefox() {
    if (!defined(isFirefoxResult)) {
        isFirefoxResult = false;

        var fields = /Firefox\/([\.0-9]+)/.exec(theNavigator.userAgent);
        if (fields !== null) {
            isFirefoxResult = true;
            firefoxVersionResult = extractVersion(fields[1]);
        }
    }
    return isFirefoxResult;
}

var hasPointerEvents: Boolean;
function supportsPointerEvents() {
    if (!defined(hasPointerEvents)) {
        //While navigator.pointerEnabled is deprecated in the W3C specification
        //we still need to use it if it exists in order to support browsers
        //that rely on it, such as the Windows WebBrowser control which defines
        //PointerEvent but sets navigator.pointerEnabled to false.

        //Firefox disabled because of https://github.com/CesiumGS/cesium/issues/6372
        hasPointerEvents =
            !isFirefox() &&
            typeof PointerEvent !== 'undefined' &&
            (!defined(theNavigator.pointerEnabled) ||
                theNavigator.pointerEnabled);
    }
    return hasPointerEvents;
}
class FeatureDetection {
    static supportsPointerEvents = supportsPointerEvents;
    static isFirefox = isFirefox;
}

export { FeatureDetection };
