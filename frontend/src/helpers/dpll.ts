import { DPLLTreeLayoutNode, DPLLTreeNode } from "../types/dpll";
import { Tree } from "../types/tree";
import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

export const dpllTreeLayout = (nodes: DPLLTreeNode[]) => {
    return treeLayout(nodes, dpllNodesToTree);
};

const dpllNodesToTree = (
    nodes: DPLLTreeNode[],
    n = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<DPLLTreeLayoutNode> => {
    const width = estimateSVGTextWidth(n.label) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => dpllNodesToTree(nodes, nodes[c], c, y + 72)),
    );
};
