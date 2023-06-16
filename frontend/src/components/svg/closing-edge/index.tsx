import { Tree } from "../../../types/tree";
import { DragTransform } from "../../../types/ui";
import { getAbsoluteDragTransform } from "../../../util/layout/tree";

import * as style from "./style.module.scss";

interface ClosingEdgeProps<T> {
    /**
     * The tree's root
     */
    root: Tree<T>;
    /**
     * The leaf as starting point of the edge
     */
    leaf: Tree<T>;
    /**
     * The pred in the tree path as ending point of the edge
     */
    pred: Tree<T>;
    /**
     * The transform modification caused by a drag
     */
    dragTransforms: Record<number, DragTransform>;
}

// Component to display an edge in a graph
const ClosingEdge = <T extends { id: number }>({
    root,
    leaf,
    pred,
    dragTransforms,
}: ClosingEdgeProps<T>) => {
    const predDt = getAbsoluteDragTransform(
        root,
        pred.data.id,
        dragTransforms,
    )!;
    const leafDt = getAbsoluteDragTransform(
        root,
        leaf.data.id,
        dragTransforms,
    )!;

    // Calculate coordinates
    const x1 = leaf.x + leafDt.x;
    const y1 = leaf.y + leafDt.y;
    const x2 = pred.x + predDt.x;
    const y2 = pred.y + predDt.y;

    // Calculate edge
    // M -> move to point x1,y1
    // Q -> draw quadratic curve (type of Bezier Curve https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Pfade)
    //      xC,yC of the control point
    //      x2,y2 of the target
    // should look like d="M x1 x2 Q xC yC x2 y2"
    const xVector = x1 - x2;
    const yVector = y1 - y2;
    let xControlPoint = x1 - xVector / 2;
    let yControlPoint = y1 - yVector / 2;
    const divisor = 2;
    if (x1 > x2) {
        // child is to the right of the parent
        xControlPoint = xControlPoint - -yVector / divisor;
        yControlPoint = yControlPoint - xVector / divisor;
    } else {
        // child is to the left of the parent
        xControlPoint = xControlPoint - yVector / divisor;
        yControlPoint = yControlPoint - -xVector / divisor;
    }

    const d = `M ${x1} ${y1} Q ${xControlPoint} ${yControlPoint} ${x2} ${y2}`;

    return <path d={d} class={style.link} />;
};

export default ClosingEdge;
