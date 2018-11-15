import {AppConstants} from "./AppConstants";
import {HexTile} from "./HexTile/HexTile";
import {HexTileColorScheme} from "./HexTile/HexTileColorScheme";
import {TileGrid} from "./TileGrid";
import {EntityText} from "./EntityText";

export class WorldGen {

    private static DAYS_PER_ROW = 8;
    private static SEASON_X_LEFT = -(WorldGen.DAYS_PER_ROW / 2) * (3 * AppConstants.TILE_RADIUS) + AppConstants.TILE_RADIUS * 2 / 3;
    public static SEASON_VERTICAL_SPACING = AppConstants.TILE_RADIUS * Math.sin(Math.PI * 60 / 180) * Math.floor(92 / WorldGen.DAYS_PER_ROW) - AppConstants.TILE_RADIUS;
    private static TEXT_LEFT_OFFSET = -2 * AppConstants.TILE_RADIUS;

    public static createFourSeasons(): HexTile[] {
        let colorWinter: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_WINTER,
            AppConstants.COLOR_CUTE_WINTER_BORDER,
            AppConstants.COLOR_CUTE_WINTER_HOVER
        );

        let colorSpring: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_SPRING,
            AppConstants.COLOR_CUTE_SPRING_BORDER,
            AppConstants.COLOR_CUTE_SPRING_HOVER
        );

        let colorSummer: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_SUMMER,
            AppConstants.COLOR_CUTE_SUMMER_BORDER,
            AppConstants.COLOR_CUTE_SUMMER_HOVER
        );

        let colorFall: HexTileColorScheme = new HexTileColorScheme(
            AppConstants.COLOR_CUTE_FALL,
            AppConstants.COLOR_CUTE_FALL_BORDER,
            AppConstants.COLOR_CUTE_FALL_HOVER
        );

        let winterGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -2, this.DAYS_PER_ROW);
        let springGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -1, this.DAYS_PER_ROW);
        let summerGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, 0, this.DAYS_PER_ROW);
        let fallGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING, this.DAYS_PER_ROW);

        let daysInFeb: number = (year % 4 == 0) ? 29 : 28;
        let daysInWinter: number = daysInFeb + 62;  // Winter: December, January, February. 31 + 31 + 28/29 days.
        let daysInSpring: number = 92;              // Spring: March, April, May. 31 + 30 + 31 days.
        let daysInSummer: number = 92;              // Summer: June, July, August. 30 + 31 + 31 days.
        let daysInFall: number = 91;                // Fall: September, October, November. 30 + 31 + 30 days.
        let daysInSeasons: number[] = [
            daysInWinter,
            daysInSpring,
            daysInSummer,
            daysInFall
        ];


        let tiles: HexTile[] = [];

        let year: number = (new Date().getFullYear()); // TODO: Should read current year from the data set...

        for (let seasonIdx = 0; seasonIdx < daysInSeasons.length; seasonIdx++) {
            let bottomIndex: number = this.calculateBottomTileBeginIndex(daysInSeasons[seasonIdx]);
            let currentGrid: TileGrid = (
                seasonIdx == 0 ? winterGrid :
                    seasonIdx == 1 ? springGrid :
                        seasonIdx == 2 ? summerGrid :
                            fallGrid
            );
            let currentColor: HexTileColorScheme = (
                seasonIdx == 0 ? colorWinter :
                    seasonIdx == 1 ? colorSpring :
                        seasonIdx == 2 ? colorSummer :
                            colorFall
            );

            for (let i = 0; i < daysInSeasons[seasonIdx]; i++) {
                let tile = new HexTile(
                    currentGrid.getNextCoordX(),
                    currentGrid.getNextCoordY(),
                    currentColor
                );
                if (this.shouldDrawBorderForTile(i, bottomIndex)) {
                    tile.isBottomTile = true;
                }
                tiles.push(tile);
                currentGrid.addTile();
            }
        }

        return tiles;

    }

    /**
     * @summary Determine at which tile index the "bottom tiles" begin.
     */
    private static calculateBottomTileBeginIndex(numTiles: number) {
        // How many tiles in last row?
        let lastRowNumTiles = numTiles % this.DAYS_PER_ROW;

        // Find the beginning of the last full row.
        let lastFullRowFirstTile = this.DAYS_PER_ROW * Math.floor(numTiles / this.DAYS_PER_ROW);

        return ((lastFullRowFirstTile - 1) - (this.DAYS_PER_ROW - lastRowNumTiles)) - this.DAYS_PER_ROW;
    }

    /**
     * @summary Determine if the bottom border for a tile should be drawn. Usually this means the tile is the last, but
     *          tiles along the side of the tile grid should also have their border drawn.
     *
     * @param tileIndex            The index of the tile in its TileGrid.
     * @param bottomTileBeginIndex The index at which a tile has no other tile directly below it.
     */
    private static shouldDrawBorderForTile(tileIndex: number, bottomTileBeginIndex: number) {
        if (tileIndex > bottomTileBeginIndex ||
            ((tileIndex + 1) % this.DAYS_PER_ROW == 0 && Math.floor(tileIndex / this.DAYS_PER_ROW) % 2 == 1) ||
            (tileIndex % this.DAYS_PER_ROW == 0 && Math.floor(tileIndex / this.DAYS_PER_ROW) % 2 == 0)
        ) {
            return true;
        }
        return false;
    }

    public static createSeasonLabels() {
        let labels: EntityText[] = [];

        labels.push(new EntityText("Winter", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_WINTER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -2 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_WINTER_BORDER));
        labels.push(new EntityText("Spring", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SPRING, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -1 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SPRING_BORDER));
        labels.push(new EntityText("Summer", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SUMMER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SUMMER_BORDER));
        labels.push(new EntityText("Fall", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_FALL, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_FALL_BORDER));

        return labels;

    }
}
