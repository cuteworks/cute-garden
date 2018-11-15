import {IRenderable} from "./IRenderable";
import {Camera} from "./Camera";

export class EntityText implements IRenderable {
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
