import {IRenderable} from "../IRenderable";
import {HexTileColorScheme} from "./HexTileColorScheme";
import {AppConstants} from "../AppConstants";
import {Camera} from "../Camera";
import {CalendarDay} from "../Calendar/CalendarDay";

export class HexTile implements IRenderable {
    private _posX: number;
    private _poxY: number;

    private _colorScheme: HexTileColorScheme;
    private _isBottomTile: boolean = false;
    private _isInFuture: boolean = false;
    private _isSelected: boolean = false;

    private _calendarDay: CalendarDay;

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

    get isInFuture(): boolean {
        return this._isInFuture;
    }

    set isInFuture(_: boolean) {
        this._isInFuture = _;
    }

    get calendarDay(): CalendarDay {
        return this._calendarDay;
    }

    set calendarDay(_: CalendarDay) {
        this._calendarDay = _;
    }

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(_: boolean) {
        this._isSelected = _;
    }

    //#endregion


    constructor(x: number = 0,
                y: number = 0,
                colorScheme: HexTileColorScheme = new HexTileColorScheme(
                    AppConstants.COLOR_CUTE_WINTER,
                    AppConstants.COLOR_CUTE_WINTER_BORDER,
                    AppConstants.COLOR_CUTE_WINTER_HOVER),
                calendarDay: CalendarDay
    ) {
        this.posX = x;
        this.posY = y;
        this.colorScheme = colorScheme;
        this.calendarDay = calendarDay;
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

        if (!this._isInFuture) {
            ctx.globalAlpha = 0.5;
        }

        this.render_drawTopPath(cam, ctx);

        if (ctx.isPointInPath(cam.mouseScreenX, cam.mouseScreenY) || this.isSelected) {
            ctx.fillStyle = this.isSelected ? AppConstants.COLOR_LIGHT : AppConstants.COLOR_DARK;
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

            ctx.moveTo(this.calcPointX(cam, 1), this.calcPointY(cam, 1));
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

        ctx.globalAlpha = 1.0;

    }

    /**
     * @summary   Draw the path for the top of the hexagon - this is used by both the rendering and the click detection
     *             by making use of the Canvas's point-in-path function.
     * @param cam The camera.
     * @param ctx The rendering context.
     */
    private render_drawTopPath(cam: Camera, ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();

        ctx.moveTo(this.calcPointX(cam, 1), this.calcPointY(cam, 1));
        ctx.lineTo(this.calcPointX(cam, 2), this.calcPointY(cam, 2));
        ctx.lineTo(this.calcPointX(cam, 3), this.calcPointY(cam, 3));
        ctx.lineTo(this.calcPointX(cam, 4), this.calcPointY(cam, 4));
        ctx.lineTo(this.calcPointX(cam, 5), this.calcPointY(cam, 5));
        ctx.lineTo(this.calcPointX(cam, 6), this.calcPointY(cam, 6));

        ctx.closePath();
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

    /**
     * @summary Determine if this tile contains a point - typically a click target. Bounding box is a little larger than
     *          the visible tile to allow for some flexibility in selecting.
     * @param x The x-coordinate to test for containment.
     * @param y The y-coordinate to test for containment.
     * @param cam        The camera.
     * @param ctx        The rendering context.
     */
    public containsPoint(x: number, y: number, cam: Camera, ctx: CanvasRenderingContext2D) {
        let boundX = this.posX - AppConstants.TILE_RADIUS;
        let boundY = this.posY - AppConstants.TILE_RADIUS * Math.sin(AppConstants.CAMERA_ANGLE_TO_GROUND);
        let boundXX = this.posX + AppConstants.TILE_RADIUS;
        let boundYY = this.posY + AppConstants.TILE_RADIUS * Math.sin(AppConstants.CAMERA_ANGLE_TO_GROUND);

        if (!(boundX < x && boundY < y && x < boundXX && y < boundYY)) {
            // Fast path out, certainly can't contain if outside of bounding box.
            return false;
        }

        // Inside bounding box but are we in the hexagonal shape of the top of the tile?
        this.render_drawTopPath(cam, ctx);
        return ctx.isPointInPath(cam.mapWorldToScreenX(x), cam.mapWorldToScreenY(y));
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
