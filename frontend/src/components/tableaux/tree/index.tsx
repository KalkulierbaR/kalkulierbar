import { h } from "preact";
import {
    SelectNodeOptions,
    TableauxNode,
    TableauxTreeLayoutNode,
} from "../../../types/calculus/tableaux";
import { DragTransform } from "../../../types/ui";
import {
    findSubTree,
    getAbsoluteDragTransform,
    getClosedLeaves,
} from "../../../util/layout/tree";
import { tableauxTreeLayout } from "../../../util/tableaux";
import ClosingEdge from "../../closing-edge";
import Zoomable from "../../zoomable";
import * as style from "./style.scss";
import SubTree from "./subtree";

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
}

const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable = false,
    dragTransforms,
    onDrag,
}) => {
    const { root, height, width: treeWidth } = tableauxTreeLayout(nodes);

    const treeHeight = Math.max(height, 200);

    /**
     * Go to a node in the tree
     * @param {any} d - The node to go to
     * @returns {[number, number]} - The target coordinates
     */
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
                                            (t) => t,
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
