import {HexTile} from "./HexTile/HexTile";


export class GameDOM {
    public static hideAllTileControls() {
        $(".tile-control").hide();
    }

    public static showTileInfo(tile: HexTile) {
        GameDOM.hideAllTileControls();
        $(".tile-control-tile-view").show();
        $(".tile-control-tile-view_tile-name").text(tile.calendarDay.monthName + " " + tile.calendarDay.dayOfMonth);
        $(".tile-control-tile-view_tile-season").text(tile.calendarDay.seasonName);
        //$(".tile-control-tile-view_tile-temperature").text(tile.posY + "");
        $(".tile-control-tile-view_tile-text").text("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
    }
}
