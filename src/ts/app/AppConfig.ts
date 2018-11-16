export class AppConfig {
    public debug_showFPS: boolean;
    public debug_showCanvasBoundingBox: boolean;
    public debug_showCursor: boolean;
    public debug_showCameraPosition: boolean;

    public pan_multiplier: number;
    public tick_delay: number;

    public momentum_multiplier: number;

    constructor() {
        this.debug_showFPS = true;
        this.debug_showCanvasBoundingBox = true;
        this.debug_showCursor = false;
        this.debug_showCameraPosition = true;

        this.pan_multiplier = 1.0;
        this.tick_delay = 33;

        this.momentum_multiplier = 1.5;
    }

}
