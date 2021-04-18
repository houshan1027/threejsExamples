import { defaultValue } from '../Core/defaultValue';
import { WebGLRenderer } from 'three';
import { GlobeCamera } from '../Scene/GlobeCamera';
import { GlobeScene } from '../Scene/GlobeScene';
import getElement from './getElement';
import { defined } from '../Core/defined';
import { DeveloperError } from '../Core/DeveloperError';
import { ScreenSpaceEventHandler } from '../Core/ScreenSpaceEventHandler';

function startRenderLoop(widget: Widgets) {
    widget._renderLoopRunning = true;

    let lastFrameTime = 0;

    function render(frameTime: any) {
        if (widget.isDestroyed()) {
            return;
        }

        if (widget._useDefaultRenderLoop) {
            try {
                let targetFrameRate = widget._targetFrameRate;
                if (!defined(targetFrameRate)) {
                    widget.resize();
                    widget.render();

                    requestAnimationFrame(render);
                } else {
                    let interval = 1000.0 / targetFrameRate;
                    let delta = frameTime - lastFrameTime;

                    if (delta > interval) {
                        widget.resize();
                        widget.render();
                        lastFrameTime = frameTime - (delta % interval);
                    }
                    requestAnimationFrame(render);
                }
            } catch (error) {
                widget._useDefaultRenderLoop = false;
                widget._renderLoopRunning = false;
                if (widget._showRenderLoopErrors) {
                    let title =
                        'An error occurred while rendering.  Rendering has stopped.';
                    //widget.showErrorPanel(title, undefined, error);

                    console.log(error);
                }
            }
        } else {
            widget._renderLoopRunning = false;
        }
    }

    requestAnimationFrame(render);
}

function configureCanvasSize(widget: Widgets) {
    let canvas = widget._canvas;
    let width: any = canvas.clientWidth;
    let height: any = canvas.clientHeight;
    let resolutionScale: any = widget.resolutionScale;

    widget._canvasWidth = width;
    widget._canvasHeight = height;

    width *= resolutionScale;
    height *= resolutionScale;

    canvas.width = width;
    canvas.height = height;

    widget.canRender = width !== 0 && height !== 0;
}

function configureCameraFrustum(widget: Widgets) {
    let canvas = widget._canvas;
    let width = canvas.width;
    let height = canvas.height;
    if (width !== 0 && height !== 0) {
        widget.scene.setSize(canvas);
    }
}

class Widgets {
    readonly scene: GlobeScene;
    readonly renderer: WebGLRenderer;
    readonly camera: GlobeCamera;
    readonly screenSpaceEventHandler: ScreenSpaceEventHandler;

    canRender: Boolean;

    _renderLoopRunning: Boolean;
    _useDefaultRenderLoop: Boolean;
    _targetFrameRate: any;
    _showRenderLoopErrors: Boolean;
    _forceResize: Boolean;
    _canvas: any;
    _canvasWidth: Number;
    _canvasHeight: Number;

    constructor(
        container: Element | String | HTMLCanvasElement,
        options?: {
            useDefaultRenderLoop?: Boolean;
            renderState?: {};
            enabledEffect?: Boolean;
            targetFrameRate?: Number;
        }
    ) {
        container = getElement(container);

        options = defaultValue(options, {});

        this.scene = new GlobeScene(container, {
            renderState: options.renderState,
            enabledEffect: options.enabledEffect
        });

        this.camera = this.scene.camera;
        this.renderer = this.scene.renderer;

        this.canRender = true;
        this._renderLoopRunning = false;

        this._useDefaultRenderLoop = false;
        this.useDefaultRenderLoop = defaultValue(
            options.useDefaultRenderLoop,
            true
        );

        this._targetFrameRate = 60;
        this.targetFrameRate = options.targetFrameRate;

        this._canvas = container;
        this._canvasWidth = 0;
        this._canvasHeight = 0;
        this._canvas.oncontextmenu = function() {
            return false;
        };
        this._canvas.onselectstart = function() {
            return false;
        };

        this._forceResize = false;

        this._showRenderLoopErrors = true;

        this.screenSpaceEventHandler = new ScreenSpaceEventHandler(
            this._canvas
        );
    }

    get useDefaultRenderLoop(): Boolean {
        return this._useDefaultRenderLoop;
    }

    set useDefaultRenderLoop(value: Boolean) {
        if (this._useDefaultRenderLoop !== value) {
            this._useDefaultRenderLoop = value;
            if (value && !this._renderLoopRunning) {
                startRenderLoop(this);
            }
        }
    }

    get targetFrameRate(): Number {
        return this._targetFrameRate;
    }

    set targetFrameRate(value: Number) {
        //>>includeStart('debug', pragmas.debug);
        if (value <= 0) {
            throw new DeveloperError(
                'targetFrameRate must be greater than 0, or undefined.'
            );
        }
        //>>includeEnd('debug');
        this._targetFrameRate = value;
    }

    get resolutionScale(): Number {
        return this.scene.pixelRatio;
    }

    resize() {
        let canvas = this._canvas;
        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        if (
            !this._forceResize &&
            this._canvasWidth === width &&
            this._canvasHeight === height
        ) {
            return;
        }

        this._forceResize = false;
        configureCanvasSize(this);
        configureCameraFrustum(this);
    }

    render() {
        if (this.canRender) {
            // this._renderer.render(this._scene, this._camera);
            this.scene.initializeFrame();

            //this.renderer.clear()

            this.scene.render();
        }
    }

    isDestroyed(): Boolean {
        return false;
    }
}

export { Widgets };
