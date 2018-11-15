import {IRenderable} from "../IRenderable";
import {HexTileColorScheme} from "./HexTileColorScheme";
import {AppConstants} from "../AppConstants";
import {Camera} from "../Camera";

export class HexTile implements IRenderable {
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
