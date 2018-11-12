/**
 * Interactive portion of the garden - logic and rendering for the canvas.
 */

class app {
    private $canvas: JQuery<HTMLElement>;
    private $canvasContainer: JQuery<HTMLElement>;

    private ctx: CanvasRenderingContext2D;
    private _cw: number;
    private _ch: number;

    private _fps: number;            // Frames-per-second
    private _framesDrawn: number;    // How many frames have been drawn in the last second

    private config: AppConfig;

    private _cam: Camera;


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

    constructor() {
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

        this.config = new AppConfig();
    }

    private initElements(): void {
        this.$canvas = $("#cutegarden-canvas");
        this.$canvasContainer = $("#cutegarden-canvas-container");
    }

    private initListeners(): void {
        $(window).on("resize", () => {
            this.onResize();
        });
    }

    private initCanvas(): void {
        this.ctx = (this.$canvas.get(0) as HTMLCanvasElement).getContext("2d");
        this.canvasResizeToContainer();
    }


    private initCamera(): void {
        this._cam = new Camera(-this.cw / 2, -this.ch / 2);
    }

    private initTimers(): void {
        window.setInterval(() => {
            this.updateFPS();
        }, 1000);
    }


    //#endregion

    //#region Event handlers

    /**
     * @summary When resizing the viewport, resize the canvas as well.
     */
    protected onResize(): void {
        this.canvasResizeToContainer();
        this.canvasRedraw();
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
    }

    /**
     * @summary Repaint the canvas.
     */
    public canvasRedraw(): void {
        this.ctx.clearRect(0, 0, this.cw, this.ch);

        Renderer.drawDebugInfo(this, this.config, this.ctx);
        this._framesDrawn++;
    }


    //#endregion
}

class AppConfig {
    public debug_showFPS: boolean;
    public debug_showCanvasBoundingBox: boolean;

    constructor() {
        this.debug_showFPS = true;
        this.debug_showCanvasBoundingBox = true;
    }

}

class AppConstants {
    public static FONT_BRAND = "Pacifico";
    public static FONT_SANS_SERIF = "Yantramanav";
    public static FONT_SERIF = "Roboto Slab";

    public static COLOR_CUTE_WHITE = "#e4e3e5";
}

class Renderer {
    public static drawDebugInfo(a: app, config: AppConfig, ctx: CanvasRenderingContext2D) {
        if (config.debug_showCanvasBoundingBox) {
            ctx.strokeStyle = "#EE0000";
            ctx.strokeRect(0, 0, a.cw, a.ch);
            ctx.strokeStyle = "#00EE00";
            ctx.strokeRect(1, 1, a.cw - 2, a.ch - 2);
            ctx.strokeStyle = "#0000EE";
            ctx.strokeRect(2, 2, a.cw - 4, a.ch - 4);
        }

        if (config.debug_showFPS) {
            ctx.fillStyle = "#00EE00";
            ctx.font = "20px " + AppConstants.FONT_SANS_SERIF;
            ctx.fillText("FPS: " + a.fps, 16, 16);
        }
    }
}

class Camera {
    private _offsetX: number;
    private _offsetY: number;

    get offsetX(): number {
        return this._offsetX;
    }

    set offsetX(_: number) {
        this._offsetX = _;
    }

    get offsetY(): number {
        return this._offsetY;
    }

    set offsetY(_: number) {
        this._offsetY = _;
    }


    constructor(offsetX: number = 0, offsetY: number = 0) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}


class HexTile {

    private readonly TILE_RADIUS = 8;

    private _posX: number;
    private _poxY: number;

    private _color: string;

    //#region Getters / setters

    public get posX(): number {
        return this._posX;
    }

    public set posX(_: number) {
        this._posX = _;
    }

    public get posY(): number {
        return this._poxY;
    }

    public set posY(_: number) {
        this._poxY = _;
    }

    public get color(): string {
        return this._color;
    }

    public set color(_: string) {
        this._color = _;
    }

    constructor(x: number = 0, y: number = 0, color: string = AppConstants.COLOR_CUTE_WHITE) {
        this.posX = x;
        this.posY = y;
        this.color = color;
    }

    public render(cam: Camera, ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();



        ctx.closePath();
        ctx.stroke();
    }
}

new app();
