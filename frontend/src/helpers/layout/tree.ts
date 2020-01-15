import { hierarchy, HierarchyNode, tree } from "d3-hierarchy";
import { D3Data } from "../../components/tableaux/tree";
import { TableauxNode } from "../../types/tableaux";

export interface TreeLayoutData {
    /**
     * The width of the circle
     */
    width: number;
    /**
     * The height of the circle
     */
    height: number;
    root: HierarchyNode<D3Data>;
}

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

export const TreeLayout = (
    nodes: TableauxNode[],
    smallScreen: boolean
): TreeLayoutData => {
    // Creates a tree layout function
    const layout = tree();

    // Transform nodes to d3 hierarchy
    const root = hierarchy(transformNodeToD3Data(0, nodes));
    // Size of the nodes. [width, height]
    const nodeSize: [number, number] = smallScreen ? [70, 70] : [140, 140];
    // Calculate tree size
    const height = root.height * nodeSize[1];
    const leaves = root.copy().count().value || 1;
    const width = leaves * nodeSize[0];

    // Let d3 calculate our layout
    layout.size([width, height]);
    layout(root);
    return {
        root,
        height,
        width
    };
};
