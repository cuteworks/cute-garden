/**
 * Interactive portion of the garden - logic and rendering for the canvas.
 */

class app {
    private $canvas: JQuery<HTMLElement>;
    private $canvasContainer: JQuery<HTMLElement>;

    private ctx: CanvasRenderingContext2D;
    private cw: number;
    private ch: number;

    private fps: number;            // Frames-per-second
    private framesDrawn: number;    // How many frames have been drawn in the last second

    private config: AppConfig;

    constructor() {
        this.init();
        this.animate();
    }

    //#region Initialization

    private init(): void {
        this.initVars();
        this.initElements();
        this.initListeners();
        this.initCanvas();
        this.initTimers();
    }

    private initVars(): void {
        this.fps = 0;
        this.framesDrawn = 0;

        this.config = new AppConfig();
    }

    private initElements(): void {
        this.$canvas = $("#cutegarden-canvas");
        this.$canvasContainer = $("#cutegarden-canvas-container");
    }

    private initListeners(): void {
        window.addEventListener("resize", this.onResize);
    }

    private initCanvas(): void {
        this.ctx = (this.$canvas.get(0) as HTMLCanvasElement).getContext("2d");
        this.canvasResizeToContainer();
    }

    private initTimers(): void {
        window.setInterval(this.updateFPS, 1000);
    }


    //#endregion

    //#region Event handlers

    /**
     * @summary When resizing the viewport, resize the canvas as well.
     */
    protected onResize(): void {
        this.canvasResizeToContainer();
        this.canvasRedraw();
    }

    //#endregion

    //#region Timers

    private updateFPS(): void {
        this.fps = this.framesDrawn;
        this.framesDrawn = 0;
    }

    //#endregion

    //#region Rendering

    /**
     * @summary Kick off the canvas's rendering - the canvas will automatically be re-rendered.
     */
    private animate(): void {
        window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
            this.animate_impl(timestamp);
        });
    }

    /**
     * @summary Automatically call canvasRedraw when the next animation frame is ready.
     */
    private animate_impl(timestamp: DOMHighResTimeStamp): void {
       // console.log("" + timestamp);
        if (timestamp < timestamp) {
            return;
        }
        window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
            this.animate_impl(timestamp);
        });
        this.canvasRedraw();
    }

    /**
     * @summary Resize the canvas to fill its containing element.
     */
    public canvasResizeToContainer() {
        this.cw = this.$canvasContainer.innerWidth();
        this.ch = this.$canvasContainer.innerHeight();

        this.$canvas.width(this.cw);
        this.$canvas.height(this.ch);
    }

    /**
     * @summary Repaint the canvas.
     */
    public canvasRedraw(): void {
        this.ctx.clearRect(0, 0, this.cw, this.ch);


        if (this.config.showFPS) {
            this.ctx.fillStyle = "#00EE00";
            this.ctx.font = AppConstants.FONT_SANS_SERIF;
            this.ctx.fillText("FPS: " + this.fps, 16, 16);
        }

        this.framesDrawn++;
    }


    //#endregion
}

class AppConfig {
    public showFPS: boolean;

    constructor() {
        this.showFPS = true;
    }

}

class AppConstants {
    public static FONT_BRAND = "Pacifico";
    public static FONT_SANS_SERIF = "Yantramanav";
    public static FONT_SERIF = "Roboto Slab";

}

new app();
