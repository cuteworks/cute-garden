import {IRenderable} from "./IRenderable";
import {HexTile} from "./HexTile/HexTile";
import {EntityText} from "./EntityText";
import {WorldGen} from "./WorldGen";
import {AppConstants} from "./AppConstants";
import {Camera} from "./Camera";

export class World implements IRenderable {
    private tiles: HexTile[] = [];
    private seasonLabels: EntityText[] = [];
    private year: number;

    private yearEntity: EntityText;

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
}
