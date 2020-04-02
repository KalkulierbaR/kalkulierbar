import { Point } from "../../types/ui";

/**
 * Gets the position of the mouse or touch from an event in an SVG
 * @param {SVGElement} node - a node in the SVG
 * @param {Event} e - the Event to get the position of
 * @returns {Point} - the position of the event
 */
export const getPoint = (node: SVGElement, e: Touch | MouseEvent): Point => {
    const svg = node.ownerSVGElement || (node as SVGSVGElement);

    let p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    p = p.matrixTransform(
        (node as SVGGraphicsElement).getScreenCTM()!.inverse(),
    );
    return [p.x, p.y];
};

/**
 * Gets the distance between two points
 * @param {Point} p1 - point 1
 * @param {Point} p2 - point 2
 * @returns {number} the distance between the points
 */
export const dist = (p1: Point, p2: Point) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return dx * dx + dy * dy;
};
