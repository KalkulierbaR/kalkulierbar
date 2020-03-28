import { Point } from "../../types/ui";
import { getPoint } from "./point";

/**
 * Gets the position of the mouse in the SVG
 * @param {SVGElement} node - a node in the SVG
 * @param {MouseEvent} e - the mouse event to get the position of
 * @returns {Point} - the mouse pos
 */
export const mousePos = (node: SVGElement, e: MouseEvent): Point => {
    return getPoint(node, e);
};
