import { Point, Transform } from "../../types/ui";
import { invert } from "./transform";

export class Gesture {
    public active = 0;
    public extent: [Point, Point];
    public taps = 0;

    public mouse?: [Point, Point];
    public touch0?: [Point, Point];
    public touch1?: [Point, Point];

    public wheel?: number;
    public moved?: boolean;

    constructor(extent: [Point, Point]) {
        this.extent = extent;
    }

    public zoom(key: "mouse" | "touch", t: Transform) {
        if (this.mouse && key !== "mouse") {
            this.mouse[1] = invert(t, this.mouse[0]);
        }
        if (this.touch0 && key !== "touch") {
            this.touch0[1] = invert(t, this.touch0[0]);
        }
        if (this.touch1 && key !== "touch") {
            this.touch1[1] = invert(t, this.touch1[0]);
        }
        return this;
    }
}
