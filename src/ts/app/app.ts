/**
 * Interactive portion of the garden - logic and rendering for the canvas.
 */

import * as $ from "jquery";

class app
{
    private canvas: JQuery<HTMLCanvasElement>;

    constructor() {
        this.canvas = $("#cutegarden-canvas");
    }
}


new app();