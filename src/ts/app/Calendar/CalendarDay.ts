export class CalendarDay {
    private _dayOfYear: number;
    private _dayOfMonth: number;
    private _monthName: string;
    private _seasonName: string;

    //#region Getters / setters

    get dayOfYear(): number {
        return this._dayOfYear;
    }

    set dayOfYear(_: number) {
        this._dayOfYear = _;
    }
    get dayOfMonth(): number {
        return this._dayOfMonth;
    }

    set dayOfMonth(_: number) {
        this._dayOfMonth = _;
    }
    get monthName(): string {
        return this._monthName;
    }

    set monthName(_: string) {
        this._monthName = _;
    }

    get seasonName(): string {
        return this._seasonName;
    }

    set seasonName(_: string) {
        this._seasonName = _;
    }

    //#endregion


    constructor(dayOfYear: number, dayOfMonth: number, monthName: string, seasonName: string) {
        this.dayOfYear = dayOfYear;
        this.dayOfMonth = dayOfMonth;
        this.monthName = monthName;
        this.seasonName = seasonName;
    }
}
