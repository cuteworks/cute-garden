/**
 * Interactive portion of the garden - logic and rendering for the canvas.
 */

class app {
    private $canvas: JQuery<HTMLElement>;
    private $canvasContainer: JQuery<HTMLElement>;

    private ctx: CanvasRenderingContext2D;
    private cw: number;
    private ch: number;

    constructor() {
        this.init();
    }

    //#region Initialization

    private init(): void {
        this.initElements();
        this.initListeners();
        this.initCanvas();
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

    //#region Rendering

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
        this.ctx.clearRect(0, 0, 3,3)
    }

    //#endregion
}

alert("!!!");
new app();
alert("HEY");