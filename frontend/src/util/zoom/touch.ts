import { Point } from "../../types/ui";

import { getPoint } from "./point";

/**
 * Gets the position of a touch event
 * @param {SVGElement} node - a node in the SVG
 * @param {TouchList} touches - List of touches to find the touch in
 * @param {number} identifier - identifier of the touch to get
 * @returns {Point} - the point of the touch
 */
export const touchPos = (
    node: SVGElement,
    touches: TouchList,
    identifier: number,
): Point | null => {
    /* tslint:disable-next-line */
    for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        if (t.identifier === identifier) {
            return getPoint(node, t);
        }
    }

    return null;
};
