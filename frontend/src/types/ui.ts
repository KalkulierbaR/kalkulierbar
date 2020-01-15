export interface Transform {
    x: number;
    y: number;
    /**
     * Scale factor.
     */
    k: number;
}

export type Point = [number, number];

export type Extent = [Point, Point];
