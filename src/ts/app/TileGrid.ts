import {AppConstants} from "./AppConstants";

export class TileGrid {
    public static SPACING_X = 1;
    public static SPACING_Y = 1;

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
        return 3 * AppConstants.TILE_RADIUS * (this._occupancy % this.width) + (rowParity * (AppConstants.TILE_RADIUS * 1.5 + TileGrid.SPACING_X / 2)) + this.x + TileGrid.SPACING_X * (this._occupancy % this.width);
    }

    public getNextCoordY(): number {
        return Math.sin(AppConstants.CAMERA_ANGLE_TO_GROUND * Math.PI / 180) * Math.sin(60 * Math.PI / 180) * AppConstants.TILE_RADIUS * Math.floor(this._occupancy / this.width) + this.y + TileGrid.SPACING_Y * (Math.floor(this._occupancy / this.width)) ;
    }

    public addTile(): void {
        this._occupancy++;
    }
}
