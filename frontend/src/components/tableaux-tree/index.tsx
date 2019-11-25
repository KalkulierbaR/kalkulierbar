import { hierarchy, HierarchyNode, tree } from "d3";
import { h } from "preact";
import { TableauxNode } from "../../types/tableaux";

import * as style from "./style.css";

interface Props {
    /**
     * The nodes of the tree
     */
    nodes: TableauxNode[];
}

interface D3Data {
    name: string;
    children?: D3Data[];
}

// Creates a tree layout function
const layout = tree();

// Size of the nodes. [width, height]
const NODE_SIZE: [number, number] = [140, 140];

/**
 * Transforms the node data received by the server to data
 * accepted by d3
 * @param {TableauxNode} node  - the node to transform
 * @param {TableauxNode[]} nodes  - list of all nodes
 * @returns {D3Data} - data as d3 parsable
 */
const transformNodeToD3Data = (
    node: TableauxNode,
    nodes: TableauxNode[]
): D3Data => {
    const children = node.children.length
        ? node.children.map(c => transformNodeToD3Data(nodes[c], nodes))
        : undefined;
    return {
        name: node.spelling,
        children
    };
};

/*
 * A single Node in the tree
 */
const TableauxTreeNode: preact.FunctionalComponent<{
    node: HierarchyNode<D3Data>;
}> = ({ node }) => {
    return (
        <text
            text-anchor="middle"
            class={style.node}
            x={(node as any).x}
            y={(node as any).y}
        >
            {node.data.name}
        </text>
    );
};

/*
 * Displays nodes as a Tree
 */
const TableauxTreeView: preact.FunctionalComponent<Props> = ({ nodes }) => {
    // Transform nodes to d3 hierarchy
    const root = hierarchy(transformNodeToD3Data(nodes[0], nodes));
    // Calculate tree size
    const treeHeight = root.height * NODE_SIZE[1];
    const leaves = root.copy().count().value || 1;
    const treeWidth = leaves * NODE_SIZE[0];
    // Let d3 calculate our layout
    layout.size([treeWidth, treeHeight]);
    layout(root);

    return (
        <div class="card">
            <svg
                class={style.svg}
                width={`${treeWidth + 16}px`}
                height={`${treeHeight + 16}px`}
            >
                <g style="transform: translateY(16px)">
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
                            <TableauxTreeNode node={n} />
                        ))}
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default TableauxTreeView;
