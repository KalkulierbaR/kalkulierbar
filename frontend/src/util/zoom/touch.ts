import { getPoint } from "./point";

export const touchPos = (
    node: SVGElement,
    touches: TouchList,
    identifier: number
) => {
    /* tslint:disable-next-line */
    for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        if (t.identifier === identifier) {
            return getPoint(node, t);
        }
    }

    return null;
};
