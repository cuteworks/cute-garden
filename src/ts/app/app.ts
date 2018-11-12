/**
 * Interactive portion of the garden - logic and rendering for the canvas.
 */

class app {
    private $canvas: JQuery<HTMLElement>;
    private $canvasContainer: JQuery<HTMLElement>;

    private _ctx: CanvasRenderingContext2D;
    private _cw: number;
    private _ch: number;

    private _fps: number;            // Frames-per-second
    private _framesDrawn: number;    // How many frames have been drawn in the last second

    private _config: AppConfig;

    private _cam: Camera;
    private _world: World;

    private _mouseRelX: number;
    private _mouseRelY: number;

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
        })
    }

    private initCanvas(): void {
        this._ctx = (this.$canvas.get(0) as HTMLCanvasElement).getContext("2d");
        this.canvasResizeToContainer();
    }


    private initCamera(): void {
        this._cam = new Camera(-this.cw / 2, -this.ch / 2, this.cw, this.ch);
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
}

class AppConfig {
    public debug_showFPS: boolean;
    public debug_showCanvasBoundingBox: boolean;
    public debug_showCursor: boolean;

    constructor() {
        this.debug_showFPS = true;
        this.debug_showCanvasBoundingBox = true;
        this.debug_showCursor = true;
    }

}

class AppConstants {
    public static FONT_BRAND = "Pacifico";
    public static FONT_SANS_SERIF = "Yantramanav";
    public static FONT_SERIF = "Roboto Slab";

    public static COLOR_CUTE_WHITE = "#e4e3e5";
    public static COLOR_CUTE_LIGHT = "#afacb3";
    public static COLOR_CUTE_GRAY = "#6d6875";
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

        if (config.debug_showCursor) {
            ctx.fillStyle = "#EE0000";
            ctx.fillRect(a.cam.mouseScreenX - 3, a.cam.mouseScreenY - 3, 6, 6);
        }
    }

    public static drawWorld(world: World, cam: Camera, ctx: CanvasRenderingContext2D) {
        world.render(cam, ctx)
    }

}

class Camera {
    private _offsetX: number;
    private _offsetY: number;
    private _width: number;
    private _height: number;
    private _mouseWorldX: number;
    private _mouseWorldY: number;
    private _mouseScreenX: number;
    private _mouseScreenY: number;
    private _angleToGround: number;

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

    get width(): number {
        return this._width;
    }

    set width(_: number) {
        this._width = _;
    }

    get height(): number {
        return this._height;
    }

    set height(_: number) {
        this._height = _;
    }

    get mouseWorldX(): number {
        return this._mouseWorldX;
    }

    set mouseWorldX(_: number) {
        this._mouseWorldX = _;
    }

    get mouseWorldY(): number {
        return this._mouseWorldY;
    }

    set mouseWorldY(_: number) {
        this._mouseWorldY = _;
    }

    get mouseScreenX(): number {
        return this._mouseScreenX;
    }

    set mouseScreenX(_: number) {
        this._mouseScreenX = _;
    }

    get mouseScreenY(): number {
        return this._mouseScreenY;
    }

    set mouseScreenY(_: number) {
        this._mouseScreenY = _;
    }

    get angleToGround(): number {
        return this._angleToGround;
    }

    set angleToGround(_: number) {
        this._angleToGround = _;
    }

    constructor(offsetX: number = 0, offsetY: number = 0, width: number = 0, height: number = 0, angleToGround: number = 45) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.angleToGround = angleToGround;

        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.mouseScreenX = 0;
        this.mouseScreenY = 0;
    }
}


class HexTile {

    private readonly TILE_RADIUS = 24;

    private _posX: number;
    private _poxY: number;

    private _colorScheme: HexTileColorScheme;

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

    public get colorScheme(): HexTileColorScheme {
        return this._colorScheme;
    }

    public set colorScheme(_: HexTileColorScheme) {
        this._colorScheme = _;
    }

    constructor(x: number = 0,
                y: number = 0,
                colorScheme: HexTileColorScheme = new HexTileColorScheme(
                    AppConstants.COLOR_CUTE_WHITE,
                    AppConstants.COLOR_CUTE_LIGHT,
                    AppConstants.COLOR_CUTE_GRAY)
    ) {
        this.posX = x;
        this.posY = y;
        this.colorScheme = colorScheme;
    }

    public render(cam: Camera, ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible(cam)) {
            return;
        }

        ctx.strokeStyle = this.colorScheme.color;
        ctx.beginPath();

        ctx.moveTo(this.calcPointX(cam, 1), this.calcPointY(cam, 1));
        ctx.lineTo(this.calcPointX(cam, 2), this.calcPointY(cam, 2));
        ctx.lineTo(this.calcPointX(cam, 3), this.calcPointY(cam, 3));
        ctx.lineTo(this.calcPointX(cam, 4), this.calcPointY(cam, 4));
        ctx.lineTo(this.calcPointX(cam, 5), this.calcPointY(cam, 5));
        ctx.lineTo(this.calcPointX(cam, 6), this.calcPointY(cam, 6));

        ctx.closePath();
        ctx.stroke();

        if (ctx.isPointInPath(cam.mouseScreenX, cam.mouseScreenY)) {
            ctx.fillStyle = this.colorScheme.colorHover;
            ctx.fill();
            console.log("It's in!");
        }

        ctx.fillStyle = this.colorScheme.colorDark;
        ctx.beginPath();

        ctx.moveTo(this.calcPointX(cam, 1), this.calcPointY(cam, 1))
        ctx.lineTo(this.calcPointX(cam, 6), this.calcPointY(cam, 6));
        ctx.lineTo(this.calcPointX(cam, 5), this.calcPointY(cam, 5));
        ctx.lineTo(this.calcPointX(cam, 4), this.calcPointY(cam, 4));

        ctx.lineTo(this.calcPointX(cam, 4), (this.calcPointY(cam, 4) + this.calcPointY(cam, 5)) / 2);
        ctx.lineTo(this.calcPointX(cam, 5), this.calcPointY(cam, 5, true));
        ctx.lineTo(this.calcPointX(cam, 6), this.calcPointY(cam, 6, true));
        ctx.lineTo(this.calcPointX(cam, 1), (this.calcPointY(cam, 1) + this.calcPointY(cam, 6)) / 2);

        ctx.closePath();
        ctx.fill();

    }

    /**
     * @summary        Determine if this tile is visible to the camera.
     * @param  cam     The camera.
     * @return boolean True if the tile is visible, false otherwise.
     */
    public isVisible(cam: Camera): boolean {
        if (this.posX + this.TILE_RADIUS < cam.offsetX) {
            return false;
        }
        if (this.posY + this.TILE_RADIUS < cam.offsetY) {
            return false;
        }
        if (this.posX - this.TILE_RADIUS > cam.offsetX + cam.width) {
            return false;
        }
        if (this.posY - this.TILE_RADIUS > cam.offsetY + cam.height) {
            return false;
        }
        return true;
    }

    private calcPointX(cam: Camera, point: number): number {
        let baseX = this.posX - cam.offsetX;

        switch (point) {
            case 1:
                return baseX - this.TILE_RADIUS;
            case 2:
            case 6:
                return baseX - this.TILE_RADIUS * Math.cos(60 * Math.PI / 180);
            case 3:
            case 5:
                return baseX + this.TILE_RADIUS * Math.cos(60 * Math.PI / 180);
            case 4:
                return baseX + this.TILE_RADIUS;
            default:
                return 0;
        }

    }

    private calcPointY(cam: Camera, point: number, ignoreCameraAngle: boolean = false): number {
        let baseY = this.posY - cam.offsetY;
        let tileRadiusProjected = this.TILE_RADIUS *
            (ignoreCameraAngle ? 1 : Math.sin(cam.angleToGround * Math.PI / 180));

        switch (point) {
            case 1:
            case 4:
                return baseY;
            case 2:
            case 3:
                return baseY - tileRadiusProjected * Math.sin(60 * Math.PI / 180);
            case 5:
            case 6:
                return baseY + tileRadiusProjected * Math.sin(60 * Math.PI / 180);
            default:
                return 0;
        }
    }
}

class HexTileColorScheme {
    private _color: string;
    private _colorDark: string;
    private _colorHover: string;

    get color(): string {
        return this._color;
    }

    set color(_: string) {
        this._color = _;
    }

    get colorDark(): string {
        return this._colorDark;
    }

    set colorDark(_: string) {
        this._colorDark = _;
    }

    get colorHover(): string {
        return this._colorHover;
    }

    set colorHover(_: string) {
        this._colorHover = _;
    }

    constructor(color: string, colorDark: string, colorHover: string) {
        this.color = color;
        this.colorDark = colorDark;
        this.colorHover = colorHover;
    }
}

class World {

    private tiles: HexTile[];

    constructor() {
        this.tiles = [];

        this.tiles.push(new HexTile(0, 0));
    }

    public render(cam: Camera, ctx: CanvasRenderingContext2D): void {
        for (let tile of this.tiles) {
            tile.render(cam, ctx);
        }
    }
}

new app(new World());
