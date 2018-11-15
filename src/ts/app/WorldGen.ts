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

        let tiles: HexTile[] = [];


        let year: number = (new Date().getFullYear()); // TODO: Should read this from the data set...
        let daysInFeb: number = (year % 4 == 0) ? 29 : 28;

        let daysInWinter: number = daysInFeb + 62;
        let daysInSpring: number = 92;
        let daysInSummer: number = 92;
        let daysInFall: number = 91;

        let winterGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -2, this.DAYS_PER_ROW);
        let springGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING * -1, this.DAYS_PER_ROW);
        let summerGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, 0, this.DAYS_PER_ROW);
        let fallGrid: TileGrid = new TileGrid(this.SEASON_X_LEFT, this.SEASON_VERTICAL_SPACING, this.DAYS_PER_ROW);


        // Winter: December, January, February. 31 + 31 + 28/29 days.
        let bottomIndex: number = this.calculateBottomTileBeginIndex(daysInWinter);
        for (let i = 0; i < daysInWinter; i++) {
            let tile = new HexTile(
                winterGrid.getNextCoordX(),
                winterGrid.getNextCoordY(),
                colorWinter
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            winterGrid.addTile();
        }

        // Spring: March, April, May. 31 + 30 + 31 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInSpring);
        for (let i = 0; i < daysInSpring; i++) {
            let tile = new HexTile(
                springGrid.getNextCoordX(),
                springGrid.getNextCoordY(),
                colorSpring
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            springGrid.addTile();
        }

        // Summer: June, July, August. 30 + 31 + 31 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInSummer);
        for (let i = 0; i < daysInSummer; i++) {
            let tile = new HexTile(
                summerGrid.getNextCoordX(),
                summerGrid.getNextCoordY(),
                colorSummer
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            summerGrid.addTile();
        }

        // Fall: September, October, November. 30 + 31 + 30 days.
        bottomIndex = this.calculateBottomTileBeginIndex(daysInFall);
        for (let i = 0; i < daysInFall; i++) {
            let tile = new HexTile(
                fallGrid.getNextCoordX(),
                fallGrid.getNextCoordY(),
                colorFall
            );
            if (i > bottomIndex || ((i + 1) % this.DAYS_PER_ROW == 0 && Math.floor(i / this.DAYS_PER_ROW) % 2 == 1)) {
                tile.isBottomTile = true;
            }
            tiles.push(tile);
            fallGrid.addTile()
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

    public static createSeasonLabels() {
        let labels: EntityText[] = [];

        labels.push(new EntityText("Winter", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_WINTER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -2 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_WINTER_BORDER));
        labels.push(new EntityText("Spring", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SPRING, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, -1 * this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SPRING_BORDER));
        labels.push(new EntityText("Summer", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_SUMMER, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_SUMMER_BORDER));
        labels.push(new EntityText("Fall", AppConstants.FONT_BRAND, "36px", AppConstants.COLOR_CUTE_FALL, this.SEASON_X_LEFT + this.TEXT_LEFT_OFFSET, this.SEASON_VERTICAL_SPACING + AppConstants.TILE_RADIUS * 0.5, AppConstants.COLOR_CUTE_FALL_BORDER));

        return labels;

    }
}
