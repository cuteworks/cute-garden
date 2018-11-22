import {HexTile} from "./HexTile/HexTile";


export class GameDOM {
    public static hideAllTileControls() {
        $(".tile-control").hide();
    }

    public static showTileInfo(tile: HexTile) {
        GameDOM.hideAllTileControls();
        $(".tile-control-tile-view").show();
        $(".tile-control-tile-view_tile-name").text(tile.calendarDay.monthName + " " + tile.calendarDay.dayOfMonth);
        $(".tile-control-tile-view_tile-season").text("todo season");
        $(".tile-control-tile-view_tile-temperature").text(tile.posY + "");
        $(".tile-control-tile-view_tile-text").text("I'm a tile!");
    }
}
