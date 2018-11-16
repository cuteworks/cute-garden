import {AppConfig} from "./AppConfig";
import {AppConstants} from "./AppConstants";
import {World} from "./World";
import {Camera} from "./Camera";
import {Game} from "./Game";

export class Renderer {
    public static drawDebugInfo(a: Game, config: AppConfig, ctx: CanvasRenderingContext2D) {
        let debugTextOffset: number = 16;

        if (config.debug_showCanvasBoundingBox) {
            ctx.strokeStyle = "#EE0000";
            ctx.strokeRect(0, 0, a.cw, a.ch);
            ctx.strokeStyle = "#00EE00";
            ctx.strokeRect(1, 1, a.cw - 2, a.ch - 2);
            ctx.strokeStyle = "#0000EE";
            ctx.strokeRect(2, 2, a.cw - 4, a.ch - 4);
        }

        if (config.debug_showFPS) {
            this.renderDebugText(ctx, "FPS: " + a.fps, debugTextOffset);
            debugTextOffset += 16;
        }

        if (config.debug_showCursor) {
            ctx.fillStyle = "#EE0000";
            ctx.fillRect(a.cam.mouseScreenX - 3, a.cam.mouseScreenY - 3, 6, 6);
        }

        if (config.debug_showCameraPosition) {
            this.renderDebugText(ctx, "camX: " + a.cam.offsetX, debugTextOffset);
            debugTextOffset += 16;
            this.renderDebugText(ctx, "camY:" + a.cam.offsetY, debugTextOffset);
            debugTextOffset += 16;
        }
    }

    private static renderDebugText(ctx: CanvasRenderingContext2D, text: string, offset: number) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#00EE00";
        ctx.font = "20px " + AppConstants.FONT_SANS_SERIF;
        ctx.fillText(text, 16, offset);
    }

    public static drawWorld(world: World, cam: Camera, ctx: CanvasRenderingContext2D) {
        world.render(cam, ctx)
    }

}
