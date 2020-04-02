import { Extent, Point, Transform } from "../../types/ui";

/**
 * Scales a transform
 * @param {Transform} t - The transform
 * @param {number} k - The zoom factor
 * @returns {Transform} the new transform
 */
export const scale = (t: Transform, k: number): Transform => ({
    k: t.k * k,
    x: t.x,
    y: t.y,
});

/**
 * translates a transform
 * @param {Transform} t - The transform
 * @param {number} x - The x value to shift by
 * @param {number} y - the y value to shift by
 * @returns {Transform} the new transform
 */
export const translate = (t: Transform, x: number, y: number): Transform => ({
    k: t.k,
    x: t.x + t.k * x,
    y: t.y + t.k * y,
});

/**
 * Applies a transform to a point
 * @param {Transform} param0 - the transform
 * @param {Point} p - the point
 * @returns {Point} the new point
 */
export const apply = ({ k, x, y }: Transform, p: Point): Point => [
    p[0] * k + x,
    p[1] * k + y,
];

/**
 * Applies the inverse of a transform to a point
 * @param {Transform} param0 - the transform
 * @param {Point} p - the point
 * @returns {Point} the new point
 */
export const invert = ({ k, x, y }: Transform, p: Point = [0, 0]): Point => [
    (p[0] - x) / k,
    (p[1] - y) / k,
];

/**
 * Applies the inverse of a transform to an x value
 * @param {Transform} t - the transform
 * @param {number} x - the x value
 * @returns {number} the new x value
 */
export const invertX = (t: Transform, x: number) => invert(t, [x, 0])[0];

/**
 * Applies the inverse of a transform to an y value
 * @param {Transform} t - the transform
 * @param {number} y - the y value
 * @returns {number} the new y value
 */
export const invertY = (t: Transform, y: number) => invert(t, [0, y])[0];

export const IDENTITY: Transform = { k: 1, x: 0, y: 0 };

// Ensures that we stay in the extent of our element
export function constrain(
    transform: Transform,
    extent: Extent,
    translateExtent: Extent,
) {
    const dx0 = invertX(transform, extent[0][0]) - translateExtent[0][0];
    const dx1 = invertX(transform, extent[1][0]) - translateExtent[1][0];
    const dy0 = invertY(transform, extent[0][1]) - translateExtent[0][1];
    const dy1 = invertY(transform, extent[1][1]) - translateExtent[1][1];
    return translate(
        transform,
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1),
    );
}
