import { defined } from './defined';

let _supportsFullscreen: boolean;
let _names: any = {
    requestFullscreen: undefined,
    exitFullscreen: undefined,
    fullscreenEnabled: undefined,
    fullscreenElement: undefined,
    fullscreenchange: undefined,
    fullscreenerror: undefined
};

let document: any = window.document;

abstract class Fullscreen {
    static element: any;
    /**
     * The element that is currently fullscreen, if any.  To simply check if the
     * browser is in fullscreen mode or not, use {@link Fullscreen#fullscreen}.
     * @memberof Fullscreen
     * @type {Object}
     * @readonly
     */
    public get element(): any {
        if (!Fullscreen.supportsFullscreen()) {
            return undefined;
        }

        return document[_names.fullscreenElement];
    }

    /**
     * The name of the event on the document that is fired when fullscreen is
     * entered or exited.  This event name is intended for use with addEventListener.
     * In your event handler, to determine if the browser is in fullscreen mode or not,
     * use {@link Fullscreen#fullscreen}.
     * @memberof Fullscreen
     * @type {String}
     * @readonly
     */
    get changeEventName() {
        if (!Fullscreen.supportsFullscreen()) {
            return undefined;
        }

        return _names.fullscreenchange;
    }

    /**
     * The name of the event that is fired when a fullscreen error
     * occurs.  This event name is intended for use with addEventListener.
     * @memberof Fullscreen
     * @type {String}
     * @readonly
     */
    get errorEventName() {
        if (!Fullscreen.supportsFullscreen()) {
            return undefined;
        }

        return _names.fullscreenerror;
    }

    get enabled() {
        if (!Fullscreen.supportsFullscreen()) {
            return undefined;
        }

        return document[_names.fullscreenEnabled];
    }

    /**
     * Determines if the browser is currently in fullscreen mode.
     * @memberof Fullscreen
     * @type {Boolean}
     * @readonly
     */
    get fullscreen() {
        if (!Fullscreen.supportsFullscreen()) {
            return undefined;
        }

        return Fullscreen.element !== null;
    }

    public static supportsFullscreen(): boolean {
        if (defined(_supportsFullscreen)) {
            return _supportsFullscreen;
        }

        _supportsFullscreen = false;

        var body = document.body;
        if (typeof body.requestFullscreen === 'function') {
            // go with the unprefixed, standard set of names
            _names.requestFullscreen = 'requestFullscreen';
            _names.exitFullscreen = 'exitFullscreen';
            _names.fullscreenEnabled = 'fullscreenEnabled';
            _names.fullscreenElement = 'fullscreenElement';
            _names.fullscreenchange = 'fullscreenchange';
            _names.fullscreenerror = 'fullscreenerror';
            _supportsFullscreen = true;
            return _supportsFullscreen;
        }

        //check for the correct combination of prefix plus the various names that browsers use
        var prefixes = ['webkit', 'moz', 'o', 'ms', 'khtml'];
        var name;
        for (var i = 0, len = prefixes.length; i < len; ++i) {
            var prefix = prefixes[i];

            // casing of Fullscreen differs across browsers
            name = prefix + 'RequestFullscreen';
            if (typeof body[name] === 'function') {
                _names.requestFullscreen = name;
                _supportsFullscreen = true;
            } else {
                name = prefix + 'RequestFullScreen';
                if (typeof body[name] === 'function') {
                    _names.requestFullscreen = name;
                    _supportsFullscreen = true;
                }
            }

            // disagreement about whether it's "exit" as per spec, or "cancel"
            name = prefix + 'ExitFullscreen';
            if (typeof document[name] === 'function') {
                _names.exitFullscreen = name;
            } else {
                name = prefix + 'CancelFullScreen';
                if (typeof document[name] === 'function') {
                    _names.exitFullscreen = name;
                }
            }

            // casing of Fullscreen differs across browsers
            name = prefix + 'FullscreenEnabled';
            if (document[name] !== undefined) {
                _names.fullscreenEnabled = name;
            } else {
                name = prefix + 'FullScreenEnabled';
                if (document[name] !== undefined) {
                    _names.fullscreenEnabled = name;
                }
            }

            // casing of Fullscreen differs across browsers
            name = prefix + 'FullscreenElement';
            if (document[name] !== undefined) {
                _names.fullscreenElement = name;
            } else {
                name = prefix + 'FullScreenElement';
                if (document[name] !== undefined) {
                    _names.fullscreenElement = name;
                }
            }

            // thankfully, event names are all lowercase per spec
            name = prefix + 'fullscreenchange';
            // event names do not have 'on' in the front, but the property on the document does
            if (document['on' + name] !== undefined) {
                //except on IE
                if (prefix === 'ms') {
                    name = 'MSFullscreenChange';
                }
                _names.fullscreenchange = name;
            }

            name = prefix + 'fullscreenerror';
            if (document['on' + name] !== undefined) {
                //except on IE
                if (prefix === 'ms') {
                    name = 'MSFullscreenError';
                }
                _names.fullscreenerror = name;
            }
        }

        return _supportsFullscreen;
    }

    /**
     * Asynchronously requests the browser to enter fullscreen mode on the given element.
     * If fullscreen mode is not supported by the browser, does nothing.
     *
     * @param {Object} element The HTML element which will be placed into fullscreen mode.
     * @param {Object} [vrDevice] The HMDVRDevice device.
     *
     * @example
     * // Put the entire page into fullscreen.
     * Cesium.Fullscreen.requestFullscreen(document.body)
     *
     * // Place only the Cesium canvas into fullscreen.
     * Cesium.Fullscreen.requestFullscreen(scene.canvas)
     */
    static requestFullscreen(element: any, vrDevice: any): void {
        if (!Fullscreen.supportsFullscreen()) {
            return;
        }

        element[_names.requestFullscreen]({ vrDisplay: vrDevice });
    }

    /**
     * Asynchronously exits fullscreen mode.  If the browser is not currently
     * in fullscreen, or if fullscreen mode is not supported by the browser, does nothing.
     */
    static exitFullscreen(): void {
        if (!Fullscreen.supportsFullscreen()) {
            return;
        }

        document[_names.exitFullscreen]();
    }

    //For unit tests
    _names = _names;
}

export { Fullscreen };
