export interface Transform {
    x: number;
    y: number;
    /**
     * Scale factor.
     */
    k: number;
}

export interface DragTransform {
    x: number;
    y: number;
}

export type Point = [number, number];

export type Extent = [Point, Point];

export interface GoToEvent extends CustomEvent {
    detail: unknown;
}
