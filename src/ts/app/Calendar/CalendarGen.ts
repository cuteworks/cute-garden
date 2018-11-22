import {CalendarDay} from "./CalendarDay";

export class CalendarGen {
    private readonly _year: number;
    private _currentDay: number = 1;

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
        let monthName = CalendarGen.__getMonthName(date.getMonth());

        return new CalendarDay(this.currentDay, dayOfMonth, monthName, CalendarGen.__getSeasonName(this.year, this.currentDay));
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
    private static __getMonthName(monthNumber: number): string {
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

    /**
     * @summary         Determine the name of the season that a given day of the year falls into.
     * @param year      The calendar year.
     * @param dayOfYear 1-based index of the day of the year to determine a season.
     * @return          The season of the given day.
     */
    private static __getSeasonName(year: number, dayOfYear: number): string {
        let daysInFeb: number = (year % 4 == 0) ? 29 : 28;
        let daysInWinter: number = daysInFeb + 62;  // Winter: December, January, February. 31 + 31 + 28/29 days.
        let daysInSpring: number = 92;              // Spring: March, April, May. 31 + 30 + 31 days.
        let daysInSummer: number = 92;              // Summer: June, July, August. 30 + 31 + 31 days.

        if (dayOfYear < 1 || dayOfYear > 366) {
            return "?";
        }

        if (dayOfYear <= daysInWinter) {
            return "Winter";
        }

        if (dayOfYear <= daysInWinter + daysInSpring) {
            return "Spring";
        }

        if (dayOfYear <= daysInWinter + daysInSpring + daysInSummer) {
            return "Summer";
        }

        return "Fall";
    }
}
