import {  FormulaNode, PSCNode, PSCTreeLayoutNode } from "../types/calculus/psc";
import { Tree,TreeLayout } from "../types/tree";
import { estimateSVGTextWidth } from "./text-width";
import { tree, treeFind, treeLayout } from "./layout/tree";

export const nodeName = (node: PSCNode) => {
    return formulaNames(node.leftFormulas) + " => " + formulaNames(node.rightFormulas);
}

export const formulaNames = (formulas: FormulaNode[]) => {
    if(formulas == null) return "";
    let result = formulas[0].name

    for (let index = 1; index < formulas.length; index++) {
        result = result + "," + formulas[index].name;
    }
    return result;
}

export const pscTreeLayout = (
    nodes: PSCNode[],
): TreeLayout<PSCTreeLayoutNode> => {
    return treeLayout(nodes, pscNodeToTree);
};

const pscNodeToTree = (
    nodes: PSCNode[],
    n: PSCNode = nodes[0],
    i: number = 0,
    y: number = 16,
):Tree<PSCTreeLayoutNode> => {
    if (n == null)
        return tree(
            0,
            -72,
            y,
            {parent: null, children: [], leftFormulas: [], rightFormulas: [], id: i },
            []
        );
    const width = estimateSVGTextWidth(nodeName(n))-56;
    return tree(
        width,
        -72,
        y,
        {...n, id: i },
        n.children.map((c) => pscNodeToTree(nodes, nodes[c], c, y-72)),
    );
};