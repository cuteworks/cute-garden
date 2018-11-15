import {Camera} from "./Camera";

export interface IRenderable {
    render(cam: Camera, ctx: CanvasRenderingContext2D): void;
}
