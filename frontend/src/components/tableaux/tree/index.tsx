import { event, hierarchy, select, tree, zoom } from "d3";
import { Fragment, h } from "preact";
import { useEffect } from "preact/hooks";

import { TableauxNode } from "../../../types/tableaux";
import TableauxTreeNode from "../node";

import * as style from "./style.css";

interface Props {
    /**
     * The nodes of the tree
     */
    nodes: TableauxNode[];
    selectedNodeId: number | undefined;
    selectNodeCallback: (node: D3Data) => void;
}

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

/*
 * Displays nodes as a Tree
 */
const TableauxTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectedNodeId,
    selectNodeCallback
}) => {
    // Transform nodes to d3 hierarchy
    const root = hierarchy(transformNodeToD3Data(0, nodes));
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
        const g = select(".g");

        // Add zoom and drag behavior
        svg.call(
            zoom().on("zoom", () => {
                g.attr(
                    "transform",
                    `translate(${event.transform.x} ${event.transform.y +
                        16}) scale(${event.transform.k})`
                );
            }) as any
        );
    });

    // TODO: Move this component out of TableauxTreeView. It should not be declared in here!
    // Component to display an edge in a graph
    const ClosingEdge: preact.FunctionalComponent<{ leafId: number }> = ({
        leafId
    }) => {
        // Filter the root descendants to get the nodes which shall be connected by the edge
        const leafFilterResult = root
            .descendants()
            .filter(n => n.data.id === leafId)[0];
        const closeRefFilterResult = root
            .descendants()
            .filter(n => n.data.id === leafFilterResult.data.closeRef)[0];

        // Calculate coordinates
        const x1 = (leafFilterResult as any).x - 3;
        const y1 = (leafFilterResult as any).y - 16;
        const x2 = (closeRefFilterResult as any).x - 3;
        const y2 = (closeRefFilterResult as any).y + 4;

        // Calculate edge
        // M -> move to point x1,y1
        // Q -> draw quadratic curve (type of Bezier Curve https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Pfade)
        //      xC,yC of the controlepoint
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

    return (
        <div class="card">
            <svg
                class={style.svg}
                width="100%"
                height={`${treeHeight + 16}px`}
                style="min-height: 60vh"
                viewBox={`0 0 ${treeWidth} ${treeHeight + 16}`}
                preserveAspectRatio="xMidyMid meet"
            >
                <g class="g" transform="translate(0 16)">
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
                                    onClick={selectNodeCallback}
                                    node={n}
                                    selected={n.data.id === selectedNodeId}
                                />
                                {n.data.isClosed ? (
                                    <ClosingEdge leafId={n.data.id} />
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
