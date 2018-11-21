import {IRenderable} from "./IRenderable";
import {HexTile} from "./HexTile/HexTile";
import {EntityText} from "./EntityText";
import {WorldGen} from "./WorldGen";
import {AppConstants} from "./AppConstants";
import {Camera} from "./Camera";
import {Game} from "./Game";

export class World implements IRenderable {

    private _game: Game;

    private tiles: HexTile[] = [];
    private seasonLabels: EntityText[] = [];
    private year: number;

    private yearEntity: EntityText;

    //#region Getters / setters

    get game(): Game {
        return this._game;
    }

    set game(_: Game) {
        this._game = _;
    }

    //#endregion


    constructor() {
        this.tiles = WorldGen.createFourSeasons();
        this.seasonLabels = WorldGen.createSeasonLabels();

        this.year = (new Date()).getFullYear();
        this.yearEntity = new EntityText(this.year + "", AppConstants.FONT_BRAND, "48px", AppConstants.COLOR_GRAY, 0, -2 * WorldGen.SEASON_VERTICAL_SPACING - 2 * AppConstants.TILE_RADIUS);
    }

    public render(cam: Camera, ctx: CanvasRenderingContext2D): void {
        for (let tile of this.tiles) {
            tile.render(cam, ctx);
        }

        ctx.textAlign = "right";
        for (let text of this.seasonLabels) {
            text.render(cam, ctx);
        }
        ctx.textAlign = "center";
        this.yearEntity.render(cam, ctx);
        ctx.textAlign = "left";
    }

    /**
     * @summary   Click handler for a click event in the world.
     * @param x   World x-coordinate of the click event.
     * @param y   World y-coordinate of the click event.
     * @param cam The camera.
     * @param ctx The rendering context.
     */
    public worldClick(x: number, y: number, cam: Camera, ctx: CanvasRenderingContext2D) {
        let firstTileSelected: HexTile;

        // Check if we're selecting a tile..
        for (let tile of this.tiles) {
            tile.isSelected = tile.containsPoint(x, y, cam, ctx);
            if (!firstTileSelected && tile.isSelected) {
                firstTileSelected = tile;
            }
        }

        if (firstTileSelected) {
            this._game.cam.setMomentumTowards(firstTileSelected.posX, firstTileSelected.posY);
        }
    }
}
