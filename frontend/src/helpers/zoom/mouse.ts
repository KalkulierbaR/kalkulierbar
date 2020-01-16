import { Point } from "../../types/ui";
import { getPoint } from "./point";

export const mousePos = (node: SVGElement, e: MouseEvent): Point => {
    return getPoint(node, e);
};
