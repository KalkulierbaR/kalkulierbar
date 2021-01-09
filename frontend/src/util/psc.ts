import {  FormulaNode, PSCNode, PSCTreeLayoutNode } from "../types/calculus/psc";
import { Tree,TreeLayout } from "../types/tree";
import { estimateSVGTextWidth } from "./text-width";
import { tree, treeFind, treeLayout } from "./layout/tree";

export const nodeName = (node: PSCNode) => {
    return formulaNames(node.leftFormula) + " ⊢ " + formulaNames(node.rightFormula);
}

export const formulaNames = (formulas: FormulaNode[]) => {
    if(formulas == null) return "";
    if(formulas.length == 0) return "";

    let result = parseFormula(formulas[0]);

    for (let index = 1; index < formulas.length; index++) {
        result = result + ", " + parseFormula(formulas[index]);
    }
    return result;
}

const parseFormula = (formula: FormulaNode) => {
    let result = "";
    switch (formula.type) {
        case "not": result += "¬" + parseFormula(formula.child!); break;
        case "and": result += parseFormula(formula.leftChild!) + " ∧ " + parseFormula(formula.rightChild!);break;
        case "or":  result += parseFormula(formula.leftChild!) + " ∨ " + parseFormula(formula.rightChild!);break;
        case "var": result += formula.spelling!;
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
    y: number = 160,
):Tree<PSCTreeLayoutNode> => {
    if (n == null)
        return tree(
            72,
            y,
            y,
            {type: "", parent: null, child: null, leftChild: null, rightChild: null, leftFormula: [], rightFormula: [],isClosed: false, id: i },
            []
        );
    const width = estimateSVGTextWidth(nodeName(n))+56;

    const resultTree: Tree<PSCTreeLayoutNode> = tree(
        width,
        72,
        y,
        {...n, id: i },
        [],
    );

    if (n.type == "leaf") {
        
    } else if (n.type == "oneChildNode") {
        resultTree.children.push(
            pscNodeToTree(nodes, nodes[n.child!], n.child!, y-42)
        );
    } else if (n.type == "twoChildNode") {
        resultTree.children.push(
            pscNodeToTree(nodes, nodes[n.leftChild!], n.leftChild!, y-42)
        )
        resultTree.children.push(
            pscNodeToTree(nodes, nodes[n.rightChild!], n.rightChild!, y-42)
        )
    } else {
        return tree(
            width,
            72,
            y,
            {type: "", parent: null, child: null, leftChild: null, rightChild: null, leftFormula: [], rightFormula: [],isClosed: false, id: i },
            []
        );
    }

    return resultTree;
};
