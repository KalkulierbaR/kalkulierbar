import { h } from "preact";
import { LayoutItem } from "../../../types/layout";
import {
    SelectNodeOptions,
    TableauxNode,
    TableauxTreeLayoutNode,
} from "../../../types/tableaux";
import { tableauxTreeLayout } from "../../../util/tableaux";
import Zoomable from "../../zoomable";
import TableauxTreeNode from "../node";
import * as style from "./style.scss";

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
}

interface ClosingEdgeProps {
    leaf: LayoutItem<TableauxTreeLayoutNode>;
    pred: LayoutItem<TableauxTreeLayoutNode>;
}

// Component to display an edge in a graph
const ClosingEdge: preact.FunctionalComponent<ClosingEdgeProps> = ({
    leaf,
    pred,
}) => {
    // Calculate coordinates
    const x1 = leaf.x;
    const y1 = leaf.y;
    const x2 = pred.x;
    const y2 = pred.y;

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

    const d =
        "M " +
        x1 +
        " " +
        y1 +
        " Q " +
        xControlpoint +
        " " +
        yControlpoint +
        " " +
        x2 +
        " " +
        y2;
    return <path d={d} class={style.link} />;
};

const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable = false,
}) => {
    const {
        data,
        height: treeHeight,
        width: treeWidth,
        links,
    } = tableauxTreeLayout(nodes);

    const transformGoTo = (d: any): [number, number] => {
        const n = d.node as number;
        const node = data[n];
        selectNodeCallback(node.data, { ignoreClause: true });

        const { x, y } = node as any;
        return [treeWidth / 2 - x, treeHeight / 2 - y];
    };

    /**
     * Returns a line to the lemma source if one exists
     * @returns {SVGLineElement | undefined} - The SVG line
     */
    const lineToLemmaSource = () => {
        if (selectedNodeId !== undefined) {
            const lemmaTarget = data.find((n) => n.data.id === selectedNodeId);

            if (lemmaTarget && lemmaTarget.data.lemmaSource !== undefined) {
                const lemmaSource = data.find(
                    (n) => n.data.id === lemmaTarget.data.lemmaSource,
                );
                if (lemmaSource !== undefined) {
                    return (
                        <line
                            class={style.lemmaLink}
                            x1={lemmaTarget.x}
                            y1={lemmaTarget.y + 6}
                            x2={lemmaSource.x}
                            y2={lemmaSource.y - 16}
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
                            data.map((n) =>
                                n.data.closeRef !== null ? (
                                    <ClosingEdge
                                        leaf={n}
                                        pred={data[n.data.closeRef]}
                                    />
                                ) : (
                                    undefined
                                ),
                            )}
                            {/* #2 render links between nodes */
                            links.map((l) => (
                                <line
                                    class={style.link}
                                    x1={l.source[0]}
                                    y1={l.source[1] + 6}
                                    x2={l.target[0]}
                                    y2={l.target[1] - 16}
                                />
                            ))}
                            {/* #3 render lemma line if it exists */
                            lineToLemmaSource()}
                            {/* #4 render nodes -> renders above all previous elements */
                            data.map((n) => (
                                <TableauxTreeNode
                                    selectNodeCallback={selectNodeCallback}
                                    node={n}
                                    selected={n.data.id === selectedNodeId}
                                    lemmaNodesSelectable={lemmaNodesSelectable}
                                />
                            ))}
                        </g>
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default TableauxTreeView;
