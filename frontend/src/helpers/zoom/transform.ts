import { Extent, Point, Transform } from "../../types/ui";

export const scale = (t: Transform, k: number): Transform => ({
    k: t.k * k,
    x: t.x,
    y: t.y
});

export const translate = (t: Transform, x: number, y: number): Transform => ({
    k: t.k,
    x: t.x + t.k * x,
    y: t.y + t.k * y
});

export const apply = ({ k, x, y }: Transform, p: Point) => [
    p[0] * k + x,
    p[1] * k + y
];

export const invert = ({ k, x, y }: Transform, p: Point = [0, 0]): Point => [
    (p[0] - x) / k,
    (p[1] - y) / k
];

export const invertX = (t: Transform, x: number) => invert(t, [x, 0])[0];
export const invertY = (t: Transform, y: number) => invert(t, [0, y])[0];

export const IDENTITY: Transform = { k: 1, x: 0, y: 0 };

export function constrain(
    transform: Transform,
    extent: Extent,
    translateExtent: Extent
) {
    const dx0 = invertX(transform, extent[0][0]) - translateExtent[0][0];
    const dx1 = invertX(transform, extent[1][0]) - translateExtent[1][0];
    const dy0 = invertY(transform, extent[0][1]) - translateExtent[0][1];
    const dy1 = invertY(transform, extent[1][1]) - translateExtent[1][1];
    return translate(
        transform,
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    );
}
