import { h } from "preact";
import {
    SelectNodeOptions,
    TableauxNode,
    TableauxTreeLayoutNode,
    ClosableNodePair,
} from "../../../types/tableaux";
import {
    getAbsoluteDragTransform,
    getClosedLeaves,
    tableauxTreeLayout,
} from "../../../util/tableaux";

import { findSubTree } from "../../../util/layout/tree";

import { LayoutItem } from "../../../types/layout";
import { Tree } from "../../../types/tree";
import { DragTransform } from "../../../types/ui";
import Zoomable from "../../zoomable";

import * as style from "./style.scss";
import SubTree from "./subtree";

// Properties Interface for the TableauxTreeView component
interface Props {
    /**
     * The nodes of the tree
     */
    nodes: TableauxNode[];
    /**
     * The id of a node if one is selected
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (
        node: TableauxTreeLayoutNode,
        options?: SelectNodeOptions,
    ) => void;
    /**
     * Informs the element that the screen is small.
     */
    smallScreen: boolean;
    /**
     * Hands the Information over, that potential Lemma nodes are selectable
     */
    lemmaNodesSelectable?: boolean;
    /**
     * Drag transforms of all nodes
     */
    dragTransforms: Record<number, DragTransform>;
    /**
     * Callback to change a specific drag
     */
    onDrag: (id: number, dt: DragTransform) => void;
    closableNodes?: ClosableNodePair;
}

interface ClosingEdgeProps {
    root: Tree<TableauxTreeLayoutNode>;
    leaf: LayoutItem<TableauxTreeLayoutNode>;
    pred: LayoutItem<TableauxTreeLayoutNode>;
    dragTransforms: Record<number, DragTransform>;
}

// Component to display an edge in a graph
const ClosingEdge: preact.FunctionalComponent<ClosingEdgeProps> = ({
    root,
    leaf,
    pred,
    dragTransforms,
}) => {
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
    const xVektor = x1 - x2;
    const yVektor = y1 - y2;
    let xControlpoint = x1 - xVektor / 2;
    let yControlpoint = y1 - yVektor / 2;
    const divisor = 2;
    if (x1 > x2) {
        // child is to the right of the parent
        xControlpoint = xControlpoint - -yVektor / divisor;
        yControlpoint = yControlpoint - xVektor / divisor;
    } else {
        // child is to the left of the parent
        xControlpoint = xControlpoint - yVektor / divisor;
        yControlpoint = yControlpoint - -xVektor / divisor;
    }

    const d = `M ${x1} ${y1} Q ${xControlpoint} ${yControlpoint} ${x2} ${y2}`;

    return <path d={d} class={style.link} />;
};

const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable = false,
    dragTransforms,
    onDrag,
    closableNodes,
}) => {
    const { root, height, width: treeWidth } = tableauxTreeLayout(nodes);

    const treeHeight = Math.max(height, 200);

    const transformGoTo = (d: any): [number, number] => {
        const n = d.node as number;

        const node = findSubTree(
            root,
            (t) => t.data.id === n,
            (t) => t,
        )!;
        selectNodeCallback(node.data, { ignoreClause: true });

        const { x, y } = node;
        return [treeWidth / 2 - x, treeHeight / 2 - y];
    };

    /**
     * Returns a line to the lemma source if one exists
     * @returns {SVGLineElement | undefined} - The SVG line
     */
    const lineToLemmaSource = () => {
        if (selectedNodeId !== undefined) {
            const lemmaTarget = findSubTree(
                root,
                (t) => t.data.id === selectedNodeId,
                (t) => t,
            );

            if (lemmaTarget && lemmaTarget.data.lemmaSource !== undefined) {
                const lemmaSource = findSubTree(
                    root,
                    (t) => t.data.id === lemmaTarget.data.lemmaSource,
                    (t) => t,
                );
                if (lemmaSource !== undefined) {
                    const sdt = getAbsoluteDragTransform(
                        root,
                        lemmaSource.data.id,
                        dragTransforms,
                    )!;
                    const tdt = getAbsoluteDragTransform(
                        root,
                        lemmaTarget.data.id,
                        dragTransforms,
                    )!;
                    return (
                        <line
                            class={style.lemmaLink}
                            x1={lemmaTarget.x + tdt.x}
                            y1={lemmaTarget.y + 6 + tdt.y}
                            x2={lemmaSource.x + sdt.x}
                            y2={lemmaSource.y - 16 + sdt.y}
                        />
                    );
                }
            }
        }
        return;
    };

    return (
        <div class="card">
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 192px)"
                style="min-height: 60vh"
                viewBox={`0 -16 ${treeWidth} ${treeHeight}`}
                preserveAspectRatio="xMidyMid meet"
                transformGoTo={transformGoTo}
            >
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        <g>
                            {/* #1 render ClosingEdges -> keep order to avoid overlapping */
                            getClosedLeaves(root).map((n) => (
                                <ClosingEdge
                                    root={root}
                                    leaf={n}
                                    pred={
                                        findSubTree(
                                            root,
                                            (t) =>
                                                t.data.id === n.data.closeRef!,
                                            ({ x, y, data }) => ({
                                                x,
                                                y,
                                                data,
                                            }),
                                        )!
                                    }
                                    dragTransforms={dragTransforms}
                                />
                            ))}
                            {/* #2 render lemma line if it exists */
                            lineToLemmaSource()}
                            {
                                /* #3 render nodes -> Recursively render each sub tree */
                                <SubTree
                                    dragTransforms={dragTransforms}
                                    onDrag={onDrag}
                                    node={root}
                                    selectedNodeId={selectedNodeId}
                                    selectNodeCallback={selectNodeCallback}
                                    lemmaNodesSelectable={lemmaNodesSelectable}
                                    zoomFactor={transform.k}
                                    closableNodes={closableNodes}
                                />
                            }
                        </g>
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default TableauxTreeView;
