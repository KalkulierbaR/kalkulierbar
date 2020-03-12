import { Point, Transform } from "../../types/ui";
import { invert } from "./transform";

// A class to store some gesture data
export class Gesture {
    /**
     * Extent of the base element
     */
    public extent: [Point, Point];
    /**
     * Current taps
     */
    public taps = 0;

    /**
     * Current mouse data.
     * The first is the current pos, the second is the start pos
     */
    public mouse?: [Point, Point];
    /**
     * Current touch data for the first touch.
     * The first is the current pos,
     * the second is the start pos,
     * the third is the touch id
     */
    public touch0?: [Point, Point, number];
    /**
     * Current touch data for the second.
     * The first is the current pos,
     * the second is the start pos,
     * the third is the touch id
     */
    public touch1?: [Point, Point, number];

    /**
     * Current wheel Timeout
     */
    public wheel?: number;
    /**
     * Have we moved during a gesture?
     */
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
