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
     * @param evt The mouse down event.
     */
    protected onMouseDown(_evt: MouseEvent): void {
        this._mouseIsDown = true;
        this._mouseDragAnchorX = this._mouseRelX;
        this._mouseDragAnchorY = this._mouseRelY;

        this.cam.applyMomentum = false;
    }

    /**
     * @summary Mouse up handler for releasing a drag or for click events.
     * @param evt The mouse up event.
     */
    protected onMouseUp(_evt: MouseEvent): void {
        this._mouseIsDown = false;
        this._mouseIsDrag = false;

        this._cam.applyMomentum = true;
    }

    /**
     * @summary Mouse leave handler for the canvas - when the mouse leaves, cancel any ongoing drag events.
     * @param evt The mouse leave event.
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

class AppConfig {
    public debug_showFPS: boolean;
    public debug_showCanvasBoundingBox: boolean;
    public debug_showCursor: boolean;

    public pan_multiplier: number;
    public tick_delay: number;

    public momentum_multiplier: number;

    constructor() {
        this.debug_showFPS = true;
        this.debug_showCanvasBoundingBox = true;
        this.debug_showCursor = true;

        this.pan_multiplier = 1.0;
        this.tick_delay = 33;

        this.momentum_multiplier = 1.5;
    }

}

class AppConstants {
    public static TILE_RADIUS = 40;
    public static CAMERA_ANGLE_TO_GROUND = 45;

    public static FONT_BRAND = "Pacifico";
    public static FONT_SANS_SERIF = "Yantramanav";
    public static FONT_SERIF = "Roboto Slab";

    public static COLOR_GRAY = "#6d6875";
    public static COLOR_LIGHT = "#afacb3";
    public static COLOR_WHITE = "#e4e3e5";

    public static COLOR_BACKGROUND = AppConstants.COLOR_WHITE;

    public static COLOR_CUTE_WINTER = "#118ab2";
    public static COLOR_CUTE_WINTER_BORDER = "#0d6582";
    public static COLOR_CUTE_WINTER_HOVER = "#bedfea";


    //public static COLOR_CUTE_RED = "#bc3908";
    //public static COLOR_CUTE_RED_LIGHT = "#941b0c";
    //public static COLOR_CUTE_RED_DARK = "#621708";

    public static COLOR_CUTE_FALL = "#ef476f";
    public static COLOR_CUTE_FALL_BORDER = "#c43b5b";
    public static COLOR_CUTE_FALL_HOVER = "#faccd7";

    public static COLOR_CUTE_SUMMER = "#ffd166";
    public static COLOR_CUTE_SUMMER_BORDER = "#d1ac54";
    public static COLOR_CUTE_SUMMER_HOVER = "#fff2d6";

    public static COLOR_CUTE_SPRING = "#06d6a0";
    public static COLOR_CUTE_SPRING_BORDER = "#05b083";
    public static COLOR_CUTE_SPRING_HOVER = "#bbf3e5";
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
    private _applyMomentum: boolean;
    private _momentumX: number;
    private _momentumY: number;
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

    get momentumX(): number {
        return this._momentumX;
    }

    set momentumX(_: number) {
        this._momentumX = _;
    }

    get momentumY(): number {
        return this._momentumY;
    }

    set momentumY(_: number) {
        this._momentumY = _;
    }

    get applyMomentum(): boolean {
        return this._applyMomentum;
    }

    set applyMomentum(_: boolean) {
        this._applyMomentum = _;
    }

    get angleToGround(): number {
        return this._angleToGround;
    }

    set angleToGround(_: number) {
        this._angleToGround = _;
    }

    constructor(offsetX: number = 0, offsetY: number = 0, width: number = 0, height: number = 0, angleToGround: number = 90) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.angleToGround = angleToGround;

        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.mouseScreenX = 0;
        this.mouseScreenY = 0;
        this.applyMomentum = false;
        this.momentumX = 0;
        this.momentumY = 0;
    }

    /**
     * @summary Logic loop for camera - apply momentum to offset and decrease momentum.
     */
    public loop(): void {
        if (!this.applyMomentum) {
            return;
        }
        if (Math.abs(this._momentumX) < 0.5) {
            this._momentumX = 0;
        }
        if (Math.abs(this._momentumY) < 0.5) {
            this._momentumY = 0;
        }
        if (Math.abs(this._momentumX) < 0.5 && Math.abs(this._momentumY) < 0.5) {
            this.applyMomentum = false;
            return;
        }

        this.offsetX += this._momentumX;
        this.offsetY += this._momentumY;

        this._momentumX /= 1.1;
        this._momentumY /= 1.1;
    }
}


class HexTile {

    private _posX: number;
    private _poxY: number;

    private _colorScheme: HexTileColorScheme;
    private _isBottomTile: boolean;

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

    get isBottomTile(): boolean {
        return this._isBottomTile;
    }

    set isBottomTile(_: boolean) {
        this._isBottomTile = _;
    }


    constructor(x: number = 0,
                y: number = 0,
                colorScheme: HexTileColorScheme = new HexTileColorScheme(
                    AppConstants.COLOR_CUTE_WINTER,
                    AppConstants.COLOR_CUTE_WINTER_BORDER,
                    AppConstants.COLOR_CUTE_WINTER_HOVER)
    ) {
        this.posX = x;
        this.posY = y;
        this.colorScheme = colorScheme;
    }

    /**
     * @summary          Render this tile to the canvas.
     * @param cam        The camera.
     * @param ctx        The rendering context.
     * @param drawBorder Whether to draw the projection's bottom border (i.e. this tile is "in front" of all others).
     */
    public render(cam: Camera, ctx: CanvasRenderingContext2D, drawBorder: boolean = false): void {
        if (!this.isVisible(cam)) {
            return;
        }

        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.colorScheme.color;
        ctx.beginPath();

        ctx.moveTo(this.calcPointX(cam, 1), this.calcPointY(cam, 1));
        ctx.lineTo(this.calcPointX(cam, 2), this.calcPointY(cam, 2));
        ctx.lineTo(this.calcPointX(cam, 3), this.calcPointY(cam, 3));
        ctx.lineTo(this.calcPointX(cam, 4), this.calcPointY(cam, 4));
        ctx.lineTo(this.calcPointX(cam, 5), this.calcPointY(cam, 5));
        ctx.lineTo(this.calcPointX(cam, 6), this.calcPointY(cam, 6));

        ctx.closePath();


        if (ctx.isPointInPath(cam.mouseScreenX, cam.mouseScreenY)) {
            ctx.fillStyle = this.colorScheme.colorHover;
            ctx.fill();
        } else {
            // Bottom tiles that are not hovered need to clear their inside to the background color, or else the bottom
            // border from other bottom tiles will be visible through the top face of this tile. Do this fill for all
            // tiles since the stroke-width will look uneven otherwise.
            ctx.fillStyle = AppConstants.COLOR_BACKGROUND;
            ctx.fill();
        }

        ctx.stroke();


        if (this.isBottomTile) {
            drawBorder = true;
        }

        if (drawBorder) {
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

    }

    /**
     * @summary        Determine if this tile is visible to the camera.
     * @param  cam     The camera.
     * @return boolean True if the tile is visible, false otherwise.
     */
    public isVisible(cam: Camera): boolean {
        if (this.posX + AppConstants.TILE_RADIUS < cam.offsetX) {
            return false;
        }
        if (this.posY + AppConstants.TILE_RADIUS < cam.offsetY) {
            return false;
        }
        if (this.posX - AppConstants.TILE_RADIUS > cam.offsetX + cam.width) {
            return false;
        }
        if (this.posY - AppConstants.TILE_RADIUS > cam.offsetY + cam.height) {
            return false;
        }
        return true;
    }

    private calcPointX(cam: Camera, point: number): number {
        let baseX = this.posX - cam.offsetX;

        switch (point) {
            case 1:
                return baseX - AppConstants.TILE_RADIUS;
            case 2:
            case 6:
                return baseX - AppConstants.TILE_RADIUS * Math.cos(60 * Math.PI / 180);
            case 3:
            case 5:
                return baseX + AppConstants.TILE_RADIUS * Math.cos(60 * Math.PI / 180);
            case 4:
                return baseX + AppConstants.TILE_RADIUS;
            default:
                return 0;
        }

    }

    private calcPointY(cam: Camera, point: number, ignoreCameraAngle: boolean = false): number {
        let baseY = this.posY - cam.offsetY;
        let tileRadiusProjected = AppConstants.TILE_RADIUS *
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
    private tiles: HexTile[] = [];
    private seasonLabels: EntityText[] = [];
    private year: number;

    private yearEntity: EntityText;

    constructor() {
        this.tiles = WorldGen.createFourSeasons();
        this.seasonLabels = WorldGen.createSeasonLabels();

        this.year = (new Date()).getFullYear();
        this.yearEntity = new EntityText(this.year + "", AppConstants.FONT_BRAND, "48px", AppConstants.COLOR_GRAY, 0, -2 * WorldGen.SEASON_VERTICAL_SPACING - 2 * AppConstants.TILE_RADIUS);
    }

    public render(cam: Camera, ctx: CanvasRenderingContext2D): void {
        for (let tile of this.tiles) {
            tile.render(cam, ctx);
        }

        ctx.textAlign = "right";
        for (let text of this.seasonLabels) {
            text.render(cam, ctx);
        }
        ctx.textAlign = "center";
        this.yearEntity.render(cam, ctx);
        ctx.textAlign = "left";
    }
}

class TileGrid {
    private _width: number;
    private _x: number;
    private _y: number;
    private _occupancy: number;

    get width(): number {
        return this._width;
    }

    set width(_: number) {
        this._width = _;
    }

    get x(): number {
        return this._x;
    }

    set x(_: number) {
        this._x = _;
    }

    get y(): number {
        return this._y;
    }

    set y(_: number) {
        this._y = _;
    }

    constructor(x: number, y: number, width: number) {
        this.x = x;
        this.y = y;
        this.width = width;

        this._occupancy = 0;
    }

    public getNextCoordX(): number {
        let rowParity = Math.floor(this._occupancy / this.width) % 2;
        return 3 * AppConstants.TILE_RADIUS * (this._occupancy % this.width) + (rowParity * AppConstants.TILE_RADIUS * 1.5) + this.x;
    }

    public getNextCoordY(): number {
        return Math.sin(AppConstants.CAMERA_ANGLE_TO_GROUND * Math.PI / 180) * Math.sin(60 * Math.PI / 180) * AppConstants.TILE_RADIUS * Math.floor(this._occupancy / this.width) + this.y;
    }

    public addTile(): void {
        this._occupancy++;
    }
}

class EntityText {
    private _text: string;
    private _font: string;
    private _size: string;

    private _color: string;
    private _x: number;
    private _y: number;

    private _shadowColor: string;

    get text(): string {
        return this._text;
    }

    set text(_: string) {
        this._text = _;
    }

    get font(): string {
        return this._font;
    }

    set font(_: string) {
        this._font = _;
    }

    get size(): string {
        return this._size;
    }

    set size(_: string) {
        this._size = _;
    }

    get color(): string {
        return this._color;
    }

    set color(_: string) {
        this._color = _;
    }

    get x(): number {
        return this._x;
    }

    set x(_: number) {
        this._x = _;
    }

    get y(): number {
        return this._y;
    }

    set y(_: number) {
        this._y = _;
    }

    get shadowColor(): string {
        return this._shadowColor;
    }

    set shadowColor(_: string) {
        this._shadowColor = _;
    }


    constructor(text: string, font: string, size: string, color: string, x: number, y: number, shadowColor?: string) {
        this.text = text;
        this.font = font;
        this.size = size;
        this.color = color;
        this.x = x;
        this.y = y;
        this.shadowColor = shadowColor;
    }


    public render(cam: Camera, ctx: CanvasRenderingContext2D) {
        ctx.font = this.size + " " + this.font;

        if (this.shadowColor) {
            ctx.fillStyle = this.shadowColor;
            ctx.fillText(this.text, this.x - cam.offsetX + 2, this.y - cam.offsetY + 2)
        }

        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x - cam.offsetX, this.y - cam.offsetY);

    }

}

class WorldGen {

    private static DAYS_PER_ROW = 8;
    private static SEASON_X_LEFT = -(WorldGen.DAYS_PER_ROW / 2) * (3 * AppConstants.TILE_RADIUS) + AppConstants.TILE_RADIUS * 2 / 3;
    public static SEASON_VERTICAL_SPACING = AppConstants.TILE_RADIUS * Math.sin(Math.PI * 60 / 180) * Math.floor(92 / WorldGen.DAYS_PER_ROW) - AppConstants.TILE_RADIUS;
    private static TEXT_LEFT_OFFSET = -2 * AppConstants.TILE_RADIUS;

    public static createFourSeasons(): HexTile[] {
        let colorWinter: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_WINTER,
            AppConstants.COLOR_CUTE_WINTER_BORDER,
            AppConstants.COLOR_CUTE_WINTER_HOVER
        );

        let colorSpring: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_SPRING,
            AppConstants.COLOR_CUTE_SPRING_BORDER,
            AppConstants.COLOR_CUTE_SPRING_HOVER
        );

        let colorSummer: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_SUMMER,
            AppConstants.COLOR_CUTE_SUMMER_BORDER,
            AppConstants.COLOR_CUTE_SUMMER_HOVER
        );

        let colorFall: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_FALL,
            AppConstants.COLOR_CUTE_FALL_BORDER,
            AppConstants.COLOR_CUTE_FALL_HOVER
        );

        let tiles: HexTile[] = [];


        let year: number = (new Date().getFullYear()); // TODO: Should read this from the data set...
        let daysInFeb: number = (year % 4 == 0) ? 29 : 28;

        let daysInWinter: number = daysInFeb + 62;
        let daysInSpring: number = 92;
        let daysInSummer: number = 92;
        let daysInFall: number = 91;

        let winterGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -2, this.DAYS_PER_ROW);
        let springGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -1, this.DAYS_PER_ROW);
        let summerGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, 0, this.DAYS_PER_ROW);
        let fallGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING, this.DAYS_PER_ROW);


        // Winter: December, January, February. 31 + 31 + 28/29 days.
        let bottomIndex: number = this.calculateBottomTileBeginIndex(daysInWinter);
        for (let i = 0; i < daysInWinter; i++) {
            let tile = new HexTile(
                winterGrid.getNextCoordX(),
                winterGrid.getNextCoordY(),
                colorWinter
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            winterGrid.addTile();
        }

        // Spring: March, April, May. 31 + 30 + 31 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInSpring)
        for (let i = 0; i < daysInSpring; i++) {
            let tile = new HexTile(
                springGrid.getNextCoordX(),
                springGrid.getNextCoordY(),
                colorSpring
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            springGrid.addTile();
        }

        // Summer: June, July, August. 30 + 31 + 31 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInSummer);
        for (let i = 0; i < daysInSummer; i++) {
            let tile = new HexTile(
                summerGrid.getNextCoordX(),
                summerGrid.getNextCoordY(),
                colorSummer
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            summerGrid.addTile();
        }

        // Fall: September, October, November. 30 + 31 + 30 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInFall);
        for (let i = 0; i < daysInFall; i++) {
            let tile = new HexTile(
                fallGrid.getNextCoordX(),
                fallGrid.getNextCoordY(),
                colorFall
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            fallGrid.addTile()
        }

        return tiles;

    }

    /**
     * @summary Determine at which tile index the "bottom tiles" begin.
     */
    private static calculateBottomTileBeginIndex(numTiles: number) {
        // How many tiles in last row?
        let lastRowNumTiles = numTiles % this.DAYS_PER_ROW;

        // Find the beginning of the last full row.
        let lastFullRowFirstTile = this.DAYS_PER_ROW * Math.floor(numTiles / this.DAYS_PER_ROW);

        return ((lastFullRowFirstTile - 1) - (this.DAYS_PER_ROW - lastRowNumTiles)) - this.DAYS_PER_ROW;
    }

    public static createSeasonLabels() {
        let labels: EntityText[] = [];

        labels.push(new EntityText("Winter", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_WINTER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -2 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_WINTER_BORDER));
        labels.push(new EntityText("Spring", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SPRING, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -1 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SPRING_BORDER));
        labels.push(new EntityText("Summer", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SUMMER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, 0 + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SUMMER_BORDER));
        labels.push(new EntityText("Fall", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_FALL, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, 1 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_FALL_BORDER));

        return labels;

    }
}

new app(new World());
