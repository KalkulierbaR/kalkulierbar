import {  FormulaNode, PSCNode, PSCTreeLayoutNode } from "../types/calculus/psc";
import { Tree,TreeLayout } from "../types/tree";
import { estimateSVGTextWidth } from "./text-width";
import { tree, treeFind, treeLayout } from "./layout/tree";

export const nodeName = (node: PSCNode) => {
    return formulaNames(node.leftFormulas) + " => " + formulaNames(node.rightFormulas);
}

export const formulaNames = (formulas: FormulaNode[]) => {
    if(formulas == null) return "";

    let result = parseFormula(formulas[0],"");

    for (let index = 1; index < formulas.length; index++) {
        result = result + "," + parseFormula(formulas[index],result);
    }
    return result;
}

const parseFormula = (formula: FormulaNode, result: string) => {
    switch (formula.type) {
        case "not": result = result + "¬"; result = result + parseFormula(formula.leftChild!, result); break;
        case "and": result = result + parseFormula(formula.leftChild!,result); result = result + "∧"; result = result + parseFormula(formula.rightChild!,result);break;
        case "or": result = result + parseFormula(formula.leftChild!,result); result = result + "∨"; result = result + parseFormula(formula.rightChild!,result);break;
        case "var": result = result + formula.spelling;
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
            {type: "", parent: null, children: [], leftFormulas: [], rightFormulas: [], id: i },
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