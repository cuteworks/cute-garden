import {AppConfig} from "./AppConfig";
import {Camera} from "./Camera";
import {World} from "./World";
import {AppConstants} from "./AppConstants";
import {Renderer} from "./Renderer";

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

    private _mouseIsDown: boolean;
    private _mouseIsDrag: boolean;
    private _mouseDragAnchorX: number;
    private _mouseDragAnchorY: number;

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

        this.init();
        this.animate();
    }

    //#region Initialization

    private init(): void {
        this.initVars();
        this.initElements();
        this.initListeners();
        this.initCanvas();
        this.initCamera();
        this.initTimers();
    }

    private initVars(): void {
        this._fps = 0;
        this._framesDrawn = 0;

        this._cam = new Camera(0, 0, 0, 0);
        this._config = new AppConfig();
    }

    private initElements(): void {
        this.$canvas = $("#cutegarden-canvas");
        this.$canvasContainer = $("#cutegarden-canvas-container");
    }

    private initListeners(): void {
        $(window).on("resize", () => {
            this.onResize();
        });

        this.$canvas.on("mousemove", (evt: Event) => {
            this.onMouseMove(evt as MouseEvent);
        });
        this.$canvas.on("touchmove", (evt: Event) => {
            this.onMouseMove(evt as MouseEvent);
        });


        this.$canvas.on("mousedown", (evt: Event) => {
            this.onMouseDown(evt as MouseEvent);
        });
        this.$canvas.on("touchstart", (evt: Event) => {
            this.onMouseDown(evt as MouseEvent);
        });

        this.$canvas.on("mouseup", (evt: Event) => {
            this.onMouseUp(evt as MouseEvent);
        });
        this.$canvas.on("touchend", (evt: Event) => {
            this.onMouseUp(evt as MouseEvent);
        });

        this.$canvas.on("mouseleave", (evt: Event) => {
            this.onMouseLeave(evt as MouseEvent);
        });
    }

    private initCanvas(): void {
        this._ctx = (this.$canvas.get(0) as HTMLCanvasElement).getContext("2d");
        this.canvasResizeToContainer();
    }


    private initCamera(): void {
        this._cam = new Camera(-this.cw / 2, -this.ch / 2, this.cw, this.ch, AppConstants.CAMERA_ANGLE_TO_GROUND);
    }

    private initTimers(): void {
        window.setInterval(() => {
            this.updateFPS();
        }, 1000);
        window.setInterval(() => {
            this.loop();
        }, this._config.tick_delay);
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
        let rect = (this.$canvas.get(0) as HTMLElement).getBoundingClientRect();

        this._mouseRelX = evt.clientX - rect.left;
        this._mouseRelY = evt.clientY - rect.top;

        if (this._mouseIsDown) {
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

    /**
     * @summary Mouse down handler for initializing a drag.
     * @param _evt The mouse down event.
     */
    protected onMouseDown(_evt: MouseEvent): void {
        this._mouseIsDown = true;
        this._mouseDragAnchorX = this._mouseRelX;
        this._mouseDragAnchorY = this._mouseRelY;

        this.cam.applyMomentum = false;
    }

    /**
     * @summary Mouse up handler for releasing a drag or for click events.
     * @param _evt The mouse up event.
     */
    protected onMouseUp(_evt: MouseEvent): void {
        this._mouseIsDown = false;
        this._mouseIsDrag = false;

        this._cam.applyMomentum = true;
    }

    /**
     * @summary Mouse leave handler for the canvas - when the mouse leaves, cancel any ongoing drag events.
     * @param _evt The mouse leave event.
     */
    protected onMouseLeave(_evt: MouseEvent): void {
        //this._mouseIsDrag = false;
        //this._mouseIsDown = false;
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
    private animate(): void {
        window.requestAnimationFrame(() => {
            this.animate_impl();
        });
    }

    /**
     * @summary Automatically call canvasRedraw when the next animation frame is ready.
     */
    private animate_impl(): void {
        window.requestAnimationFrame(() => {
            this.animate_impl();
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
}
