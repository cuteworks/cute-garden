export class HexTileColorScheme {
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
