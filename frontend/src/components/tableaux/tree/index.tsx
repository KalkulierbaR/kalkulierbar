import { HierarchyNode } from "d3-hierarchy";
import { Fragment, h } from "preact";

import { SelectNodeOptions, TableauxNode } from "../../../types/tableaux";
import TableauxTreeNode from "../node";

import { TreeLayout } from "../../../helpers/layout/tree";
import Zoomable from "../../zoomable";
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
    selectNodeCallback: (node: D3Data, options?: SelectNodeOptions) => void;
    /**
     * Informs the element that the screen is small.
     */
    smallScreen: boolean;
}

// Interface for a node
export interface D3Data {
    id: number;
    name: string;
    isLeaf: boolean;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children?: D3Data[];
}

/**
 *
 * @param {Array<HierarchyNode<D3Data>>} nodes - The nodes we iterate over
 * @param {number} id - Id of the ancestor
 * @returns {HierarchyNode<D3Data>} - The ancestor
 */
const getNodeById = (nodes: Array<HierarchyNode<D3Data>>, id: number) =>
    nodes.find(n => n.data.id === id)!;

interface ClosingEdgeProps {
    leaf: HierarchyNode<D3Data>;
    pred: HierarchyNode<D3Data>;
}

// Component to display an edge in a graph
const ClosingEdge: preact.FunctionalComponent<ClosingEdgeProps> = ({
    leaf,
    pred
}) => {
    // Calculate coordinates
    const x1 = (leaf as any).x;
    const y1 = (leaf as any).y;
    const x2 = (pred as any).x;
    const y2 = (pred as any).y;

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
    //   console.log('M ${x1} ${y1} Q ${xControlpoint} ${yControlpoint} ${x2} ${y2}')
    return <path d={d} class={style.link} />;
};

const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    smallScreen,
    selectNodeCallback,
    selectedNodeId
}) => {
    const { root, height: treeHeight, width: treeWidth } = TreeLayout(
        nodes,
        smallScreen
    );

    const transformGoTo = (d: any): [number, number] => {
        const n = d.node as number;

        const node = getNodeById(root.descendants(), n);

        selectNodeCallback(node.data, { ignoreClause: true });

        const { x, y } = node as any;

        return [treeWidth / 2 - x, treeHeight / 2 - y];
    };

    return (
        <div class="card">
            <Zoomable
                class={style.svg}
                width="100%"
                height={`${treeHeight + 16}px`}
                style="min-height: 60vh"
                viewBox={`0 -10 ${treeWidth} ${treeHeight + 64}`}
                preserveAspectRatio="xMidyMid meet"
                transformGoTo={transformGoTo}
            >
                {transform => (
                    <g
                        transform={`translate(${transform.x} ${transform.y +
                            16}) scale(${transform.k})`}
                    >
                        <g>
                            {
                                <Fragment>
                                    {/* First render ClosingEdges -> keep order to avoid overlapping */
                                    root!
                                        .descendants()
                                        .map(n =>
                                            n.data.closeRef !== null ? (
                                                <ClosingEdge
                                                    leaf={n}
                                                    pred={getNodeById(
                                                        n.ancestors(),
                                                        n.data.closeRef
                                                    )}
                                                />
                                            ) : null
                                        )}
                                    {/* Second render links between nodes */
                                    root!.links().map(l => (
                                        <line
                                            class={style.link}
                                            x1={(l.source as any).x}
                                            y1={(l.source as any).y + 6}
                                            x2={(l.target as any).x}
                                            y2={(l.target as any).y - 18}
                                        />
                                    ))}
                                    {/* Third render nodes -> renders above all previous elements */
                                    root!.descendants().map(n => (
                                        <TableauxTreeNode
                                            selectNodeCallback={
                                                selectNodeCallback
                                            }
                                            node={n}
                                            selected={
                                                n.data.id === selectedNodeId
                                            }
                                        />
                                    ))}
                                </Fragment>
                            }
                        </g>
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default TableauxTreeView;
