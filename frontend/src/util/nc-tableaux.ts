import { NCTableauxNode, NCTabTreeNode } from "../types/nc-tableaux";
import { Tree } from "../types/tree";
import { estimateSVGTextWidth } from "./text-width";
import { tree, treeLayout } from "./layout/tree";

export const ncTabTreeLayout = (nodes: NCTableauxNode[]) =>
    treeLayout(nodes, ncTabNodeToTree);

const ncTabNodeToTree = (
    nodes: NCTableauxNode[],
    n: NCTableauxNode = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<NCTabTreeNode> => {
    const width = estimateSVGTextWidth(n.spelling) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => ncTabNodeToTree(nodes, nodes[c], c, y + 72)),
    );
};
