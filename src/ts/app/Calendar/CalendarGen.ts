import {CalendarDay} from "./CalendarDay";

export class CalendarGen {
    private readonly _year: number;
    private _currentDay: number = 0;

    //#region Getters / setters

    get year() {
        return this._year;
    }

    get currentDay() {
        return this._currentDay;
    }

    //#endregion

    constructor(year: number) {
        this._year = year;
    }

    /**
     * @summary Generate a CalendarDay object representing the current day of this calendar generator.
     */
    public getNextCalendarDay(): CalendarDay {
        let date = new Date(new Date(this.year, 0).setDate(this.currentDay));

        let dayOfMonth = date.getDate();
        let monthName = CalendarGen.__getMonthName(dayOfMonth);

        return new CalendarDay(this.currentDay, dayOfMonth, monthName);
    }

    /**
     * @summary Increment the day to be generated next.
     */
    public incrementDay(): void {
        this._currentDay++;
    }

    /**
     * @summary Return the name of a month given its 0-indexed month ID.
     * @param monthNumber The 0-indexed month ID.
     */
    private static __getMonthName(monthNumber: number) {
        switch (monthNumber) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
            default:
                return "?";
        }
    }
}
