import { Point } from "../../types/ui";

export const mousePos = (node: SVGElement, e: MouseEvent): Point => {
    const owner = node.ownerSVGElement || (node as SVGSVGElement);
    if (owner) {
        let p = owner.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        p = p.matrixTransform(
            (node as SVGGraphicsElement).getScreenCTM()!.inverse()
        );
        return [p.x, p.y];
    }
    const rect = node.getBoundingClientRect();
    return [
        e.clientX - rect.left - node.clientLeft,
        e.clientY - rect.top - node.clientTop
    ];
};
