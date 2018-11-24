import {AppConfig} from "./AppConfig";
import {Camera} from "./Camera";
import {World} from "./World";
import {AppConstants} from "./AppConstants";
import {Renderer} from "./Renderer";
import {HexTile} from "./HexTile/HexTile";
import {GameDOM} from "./GameDOM";

export class Game {
    private $canvas: JQuery<HTMLElement>;
    private $canvasContainer: JQuery<HTMLElement>;

    private _ctx: CanvasRenderingContext2D;
    private _cw: number;
    private _ch: number;

    private _fps: number;            // Frames-per-second
    private _framesDrawn: number;    // How many frames have been drawn in the last second

    private _config: AppConfig;

    private _cam: Camera;
    private readonly _world: World;

    private _mouseRelX: number;
    private _mouseRelY: number;

    private _mouseDownTimestamp: number;
    private _mouseIsDown: boolean;
    private _mouseIsDrag: boolean;
    private _mouseDragAnchorX: number;
    private _mouseDragAnchorY: number;

    private _hasReceivedFirstUserInput: boolean;

    //#region Getters / setters

    public get cw(): number {
        return this._cw;
    }

    public get ch(): number {
        return this._ch;
    }


    public get fps(): number {
        return this._fps;
    }

    public get framesDrawn(): number {
        return this._framesDrawn;
    }


    get cam(): Camera {
        return this._cam;
    }

    //#endregion

    constructor(world: World) {
        this._world = world;
        this._world.game = this;

        this.__init();
        this.__animate();
    }

    //#region Initialization

    private __init(): void {
        this.__initVars();
        this.__initElements();
        this.__initListeners();
        this.__initCanvas();
        this.__initCamera();
        this.__initTimers();
    }

    private __initVars(): void {
        this._fps = 0;
        this._framesDrawn = 0;

        this._cam = new Camera(0, 0, 0, 0);
        this._config = new AppConfig();

        this._mouseRelX = 0;
        this._mouseRelY = 0;
        this._mouseDragAnchorX = 0;
        this._mouseDragAnchorY = 0;
    }

    private __initElements(): void {
        this.$canvas = $("#cutegarden-canvas");
        this.$canvasContainer = $("#cutegarden-canvas-container");
    }

    private __initListeners(): void {
        $(window).on("resize", () => {
            this.onResize();
        });

        this.$canvas.on("mousemove", (evt: Event) => {
            this.onMouseMove(evt as MouseEvent);
        });
        this.$canvas.on("touchmove", (evt: Event) => {
            this.onTouchMove(evt as TouchEvent);
            evt.preventDefault(); // Prevent rubberbanding on iOS devices.
        });


        this.$canvas.on("mousedown", (evt: Event) => {
            this.onMouseDown(evt as MouseEvent);
        });
        this.$canvas.on("touchstart", (evt: Event) => {
            if ((evt as TouchEvent).touches.length > 1) {
                // Prevent multi-touch from sending us flying (multi-touch still a little weird)
                evt.preventDefault();
                return;
            }
            this.onTouchDown(evt as TouchEvent);
        });

        this.$canvas.on("mouseup", (evt: Event) => {
            this.onMouseUp(evt as MouseEvent);
        });
        this.$canvas.on("touchend", (evt: Event) => {
            this.onTouchUp(evt as TouchEvent);
        });

        this.$canvas.on("click", (evt: Event) => {
           this.__initAfterFirstInput(evt as MouseEvent);
        });
    }

    private __initCanvas(): void {
        this._ctx = (this.$canvas.get(0) as HTMLCanvasElement).getContext("2d");
        this.canvasResizeToContainer();
    }


    private __initCamera(): void {
        this._cam = new Camera(-this.cw / 2, -this.ch / 2, this.cw, this.ch, AppConstants.CAMERA_ANGLE_TO_GROUND);
    }

    private __initTimers(): void {
        window.setInterval(() => {
            this.updateFPS();
        }, 1000);
        window.setInterval(() => {
            this.loop();
        }, this._config.tick_delay);
    }

    /**
     * @summary    Many APIs are not allowed to be called until the user has interacted with the page (e.g. fullscreen).
     *             Perform setup for those APIs here.
     * @param _evt The mouse event representing the first user input.
     */
    private __initAfterFirstInput(_evt: MouseEvent): void {
        if (this._hasReceivedFirstUserInput) {
            return;
        }

        this._hasReceivedFirstUserInput = true;
        Game.__attemptFullscreenCanvas();
    }

    //#endregion

    //#region Event handlers

    /**
     * @summary When resizing the viewport, resize the canvas as well.
     */
    protected onResize(): void {
        let oldWidth = this.cam.width;
        let oldHeight = this.cam.height;

        this.canvasResizeToContainer();

        let newWidth = this.cam.width;
        let newHeight = this.cam.height;

        this.cam.offsetX -= (newWidth - oldWidth) / 2;
        this.cam.offsetY -= (newHeight - oldHeight) / 2;

        this.canvasRedraw();
    }

    protected onMouseMove(evt: MouseEvent): void {
        this.__inputDeviceMove(evt.clientX, evt.clientY);
    }

    /**
     * @summary Mouse down handler for initializing a drag.
     * @param _evt The mouse down event.
     */
    protected onMouseDown(_evt: MouseEvent): void {
        this.__inputDeviceDown();
    }

    /**
     * @summary Mouse up handler for releasing a drag or for click events.
     * @param _evt The mouse up event.
     */
    protected onMouseUp(_evt: MouseEvent): void {
        this.__inputDeviceUp();
    }

    protected onTouchDown(_evt: TouchEvent): void {
        //this.__inputDeviceDown();
        let touch = _evt.changedTouches[0];
        if (!touch) {
            return;
        }

        this.__inputDeviceDown(touch.clientX, touch.clientY);
    }

    /**
     * @summary Touch up handler for releasing a drag or click events.
     * @param _evt The touch up event.
     */
    protected onTouchUp(_evt: TouchEvent): void {
        this.__inputDeviceUp();
    }

    protected onTouchMove(_evt: TouchEvent): void {
        let touch = _evt.changedTouches[0];
        if (!touch) {
            return;
        }

        this.__inputDeviceMove(touch.clientX, touch.clientY);
    }

    //#endregion

    //#region Event handlers - shared logic

    private __inputDeviceDown(anchorX: number = this._mouseRelX, anchorY: number = this._mouseRelY): void {
        this._mouseIsDown = true;
        this._mouseDragAnchorX = anchorX;
        this._mouseDragAnchorY = anchorY;
        this._mouseDownTimestamp = +new Date();

        this.cam.applyMomentum = false;
    }

    private __inputDeviceUp(): void {
        if (!this._mouseIsDrag) {
            if (this._world) {
                this._world.worldClick(this.cam.mapScreenToWorldX(this._mouseRelX), this.cam.mapScreenToWorldY(this._mouseRelY), this.cam, this._ctx);
            }
        }

        this._mouseIsDown = false;
        this._mouseIsDrag = false;

        this._cam.applyMomentum = true;
    }

    private __inputDeviceMove(posX: number, posY: number): void {
        let rect = (this.$canvas.get(0) as HTMLElement).getBoundingClientRect();

        this._mouseRelX = posX - rect.left;
        this._mouseRelY = posY - rect.top;

        let mouseDownDelta: number;

        if (this._mouseIsDown) {
            mouseDownDelta = +new Date() - this._mouseDownTimestamp;
        }

        if (this._mouseIsDown && mouseDownDelta > AppConstants.CAMERA_DRAG_DELAY) {
            this._mouseIsDrag = true;
        }

        if (this._mouseIsDrag) {
            let deltaX = (this._mouseRelX - this._mouseDragAnchorX) * this._config.pan_multiplier;
            let deltaY = (this._mouseRelY - this._mouseDragAnchorY) * this._config.pan_multiplier;

            this.cam.offsetX -= deltaX;
            this.cam.offsetY -= deltaY;

            this._cam.momentumX = -deltaX * this._config.momentum_multiplier;
            this._cam.momentumY = -deltaY * this._config.momentum_multiplier;

            this._mouseDragAnchorX = this._mouseRelX;
            this._mouseDragAnchorY = this._mouseRelY;
        }
    }

    //#endregion

    //#region Timers

    private updateFPS(): void {
        this._fps = this.framesDrawn;
        this._framesDrawn = 0;
    }

    //#endregion

    //#region Rendering

    /**
     * @summary Kick off the canvas's rendering - the canvas will automatically be re-rendered.
     */
    private __animate(): void {
        window.requestAnimationFrame(() => {
            this.__animate_impl();
        });
    }

    /**
     * @summary Automatically call canvasRedraw when the next animation frame is ready.
     */
    private __animate_impl(): void {
        window.requestAnimationFrame(() => {
            this.__animate_impl();
        });

        this.canvasRedraw();
    }

    /**
     * @summary Resize the canvas to fill its containing element.
     */
    public canvasResizeToContainer() {
        this._cw = this.$canvasContainer.width();
        this._ch = this.$canvasContainer.height();

        (this.$canvas.get(0) as HTMLCanvasElement).width = this.cw;
        (this.$canvas.get(0) as HTMLCanvasElement).height = this.ch;

        this.cam.width = this.cw;
        this.cam.height = this.ch;
    }

    /**
     * @summary Repaint the canvas.
     */
    public canvasRedraw(): void {
        this._ctx.clearRect(0, 0, this.cw, this.ch);

        // The mouse position really only needs to be updated when it's being drawn.
        this.cam.mouseScreenX = this._mouseRelX;
        this.cam.mouseScreenY = this._mouseRelY;
        this.cam.mouseWorldX = this.cam.offsetX + this._mouseRelX;
        this.cam.mouseWorldY = this.cam.offsetY + this._mouseRelY;

        Renderer.drawWorld(this._world, this.cam, this._ctx);
        Renderer.drawDebugInfo(this, this._config, this._ctx);
        this._framesDrawn++;
    }

    //#endregion

    //#region Game loop

    /**
     * @summary Game main logic loop. Call event logic on world, camera, and anything else that needs to run logic.
     */
    public loop() {
        this._cam.loop();
    }

    //#endregion

    //#region DOM Helpers / Page Setup

    private static __attemptFullscreenCanvas() {
        // Attempt to go full-screen on mobile or small screens.
        if ($("body").width() > 1024) {
            return;
        }

        let fullscreenFn: Function;
        let $canvas = $("body").get(0) as any;

        if ($canvas.requestFullscreen) {
            fullscreenFn = $canvas.requestFullscreen;
        } else if ($canvas.mozRequestFullScreen) {
            fullscreenFn = $canvas.mozRequestFullScreen;
        } else if ($canvas.webkitRequestFullScreen) {
            fullscreenFn = $canvas.webkitRequestFullScreen;
        } else if ($canvas.msRequestFullscreen) {
            fullscreenFn = $canvas.msRequestFullscreen;
        }

        if (fullscreenFn) {
            fullscreenFn.call($canvas);
        }
    }

    //#endregion

    //#region Game logic

    public selectTile(tile: HexTile): void {
        if (!tile) {
            GameDOM.hideAllTileControls();
            return;
        }

        if (tile.isInFuture) {
            GameDOM.showTileWriteBasic(tile);
        } else {
            GameDOM.showTileInfo(tile);
        }
    }

    //#endregion
}
