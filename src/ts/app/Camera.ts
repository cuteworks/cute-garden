import {ILoopable} from "./ILoopable";

export class Camera implements ILoopable {
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
        // noinspection JSSuspiciousNameCombination
        if (Math.abs(this._momentumY) < 0.5) {
            this._momentumY = 0;
        }
        // noinspection JSSuspiciousNameCombination
        if (Math.abs(this._momentumX) < 0.5 && Math.abs(this._momentumY) < 0.5) {
            this.applyMomentum = false;
            return;
        }

        this.offsetX += this._momentumX;
        this.offsetY += this._momentumY;

        this._momentumX /= 1.1;
        this._momentumY /= 1.1;
    }

    /**
     * @summary Set the momentum of the camera such that it will "land" on the given point.
     * @param x The x-coordinate to scroll to.
     * @param y The y-coordinate to scroll to.
     */
    public setMomentumTowards(x: number, y: number) {
        let camCenterX = this.offsetX + this.width / 2;
        let camCenterY = this.offsetY + this.height / 2;

        let deltaX = x - camCenterX;
        let deltaY = y - camCenterY;

        // Need to add deltaX and deltaY to the offsets via momentum.
        this._momentumX = deltaX / 11;
        this._momentumY = deltaY / 11;

    }

    public mapScreenToWorldX(x: number): number {
        return x + this.offsetX;
    }

    public mapScreenToWorldY(y: number): number {
        return y + this.offsetY;
    }

    public mapWorldToScreenX(x: number): number {
        return x - this.offsetX;
    }

    public mapWorldToScreenY(y: number): number {
        return y - this.offsetY;
    }
}
