import { event, hierarchy, HierarchyNode, select, tree, zoom } from "d3";
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";

import { TableauxNode } from "../../../types/tableaux";
import TableauxTreeNode from "../node";

import * as nodeStyle from "../node/style.css";
import * as style from "./style.css";

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
    selectNodeCallback: (node: D3Data) => void;
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

// Creates a tree layout function
const layout = tree();

// Size of the nodes. [width, height]
const NODE_SIZE: [number, number] = [140, 140];

/**
 * Transforms the node data received by the server to data
 * accepted by d3
 * @param {number} id  - the node to transform
 * @param {TableauxNode[]} nodes  - list of all nodes
 * @returns {D3Data} - data as d3 parsable
 */
const transformNodeToD3Data = (id: number, nodes: TableauxNode[]): D3Data => {
    const node = nodes[id];
    const isLeaf = !node.children.length;
    const children = isLeaf
        ? undefined
        : node.children.map(c => transformNodeToD3Data(c, nodes));

    return {
        id,
        name: node.spelling,
        isLeaf,
        children,
        negated: node.negated,
        isClosed: node.isClosed,
        closeRef: node.closeRef
    };
};

/**
 *
 * @param {HierarchyNode<D3Data>} node - The node whose ancestor we want
 * @param {number} id - Id of the ancestor
 * @returns {HierarchyNode<D3Data>} - The ancestor
 */
const getAncestorById = (node: HierarchyNode<D3Data>, id: number) =>
    node.ancestors().find(n => n.data.id === id)!;

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
    const x1 = (leaf as any).x - 3;
    const y1 = (leaf as any).y - 16;
    const x2 = (pred as any).x - 3;
    const y2 = (pred as any).y + 4;

    // Calculate edge
    // M -> move to point x1,y1
    // Q -> draw quadratic curve (type of Bezier Curve https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Pfade)
    //      xC,yC of the control point
    //      x2,y2 of the target
    // should look like d="M x1 x2 Q xC yC x2 y2"
    const d =
        "M " +
        x1 +
        " " +
        y1 +
        " Q " +
        (x1 - (y1 - y2) / 2) +
        " " +
        (y1 + y2) / 2 +
        " " +
        x2 +
        " " +
        y2;

    return <path d={d} class={style.link} />;
};

interface Transform {
    x: number;
    y: number;
    k: number;
}

// Component displaying nodes as a TableauxTree
const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectedNodeId,
    selectNodeCallback
}) => {
    // Transform nodes to d3 hierarchy
    const root = hierarchy(transformNodeToD3Data(0, nodes));

    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

    // Calculate tree size
    const treeHeight = root.height * NODE_SIZE[1];
    const leaves = root.copy().count().value || 1;
    const treeWidth = leaves * NODE_SIZE[0];

    // Let d3 calculate our layout
    layout.size([treeWidth, treeHeight]);
    layout(root);

    useEffect(() => {
        // Get the elements to manipulate
        const svg = select(`.${style.svg}`);

        // Add zoom and drag behavior
        svg.call(
            zoom().on("zoom", () => {
                const { x, y, k } = event.transform as Transform;
                setTransform({ x, y, k });
            }) as any
        );
    });

    // Available node filling styles
    // const nodeFillingStyles = [nodeStyle.f1, nodeStyle.f2, nodeStyle.f3, nodeStyle.f4, nodeStyle.f5];

    /**
     * Get the appropriate filling style for a node
     * @param {HierarchyNode<D3Data>} n - The node to style 
     * @returns {string} - The css style class
     */
    const getNodeFillingStyle = (n: HierarchyNode<D3Data>) => {
        if(n.data.isClosed){
            return nodeStyle.fClosed;
        }
        
        // Select a filling style based on the first character of the node's name
        // const nodeName = n.data.name;
        // const firstCharCode = nodeName.charCodeAt(0);
        // const styleIndex = firstCharCode % nodeFillingStyles.length;
        // return nodeFillingStyles[styleIndex];

        return nodeStyle.fDefault;
    }

    return (
        <div class="card">
            <svg
                class={style.svg}
                width="100%"
                height={`${treeHeight + 64}px`}
                style="min-height: 60vh"
                viewBox={`0 -10 ${treeWidth} ${treeHeight + 64}`}
                preserveAspectRatio="xMidyMid meet"
            >
                <g
                    transform={`translate(${transform.x} ${transform.y +
                        16}) scale(${transform.k})`}
                >
                    <g class="links">
                        {root.links().map(l => (
                            <line
                                class={style.link}
                                x1={(l.source as any).x}
                                y1={(l.source as any).y + 6}
                                x2={(l.target as any).x}
                                y2={(l.target as any).y - 18}
                            />
                        ))}
                    </g>
                    <g class="nodes">
                        {root.descendants().map(n => (
                            <Fragment>
                                <TableauxTreeNode
                                    selectNodeCallback={selectNodeCallback}
                                    node={n}
                                    selected={n.data.id === selectedNodeId}
                                    filling={getNodeFillingStyle(n)}
                                />
                                {n.data.isClosed && n.data.isLeaf ? (
                                    <ClosingEdge
                                        leaf={n}
                                        pred={getAncestorById(
                                            n,
                                            n.data.closeRef!
                                        )}
                                    />
                                ) : null}
                            </Fragment>
                        ))}
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default TableauxTreeView;
