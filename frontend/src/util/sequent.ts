import {FormulaNode, SequentNode, SequentTreeLayoutNode,} from "../types/calculus/sequent";
import {Tree, TreeLayout} from "../types/tree";

import {tree, treeLayout} from "./layout/tree";
import {estimateSVGTextWidth} from "./text-width";

/**
 * parse a whole node with all its formulas
 * @param {SequentNode} node - the node
 * @returns {string} all formulas in the node with all seperators as a string
 */
export const nodeName = (node: SequentNode) => {
    return (
        formulaNames(node.leftFormulas) +
        " ⊢ " +
        formulaNames(node.rightFormulas)
    );
};

/**
 *
 * @param {FormulaNode[]} formulas - multiple formulas
 * @returns {string} all formulas as a concat string
 */
export const formulaNames = (formulas: FormulaNode[]) => {
    if (formulas == null) return "";
    if (formulas.length === 0) return "";

    let result = parseFormula(formulas[0]);

    for (let index = 1; index < formulas.length; index++) {
        result = result + ", " + parseFormula(formulas[index]);
    }
    return result;
};

export const parseStringToListIndex = (str: string) => {
    return parseInt(str.substring(1));
};

/**
 * Parses a formula
 * @param {FormulaNode} formula - the formula
 * @returns {string} the formula as a string
 */
export const parseFormula = (formula: FormulaNode) => {
    let result = "";
    if (formula === undefined) return result;
    // FIXME: Make cases consistent, e.g., "Relation"
    switch (formula.type) {
        case "not":
            result += "¬" + parseFormula(formula.child!);
            break;
        case "and":
            result +=
                "(" +
                parseFormula(formula.leftChild!) +
                " ∧ " +
                parseFormula(formula.rightChild!) +
                ")";
            break;
        case "or":
            result +=
                "(" +
                parseFormula(formula.leftChild!) +
                " ∨ " +
                parseFormula(formula.rightChild!) +
                ")";
            break;
        case "var":
            result += formula.spelling!;
            break;
        case "impl":
            result +=
                "(" +
                parseFormula(formula.leftChild!) +
                " → " +
                parseFormula(formula.rightChild!) +
                ")";
            break;
        case "equiv":
            result +=
                "(" +
                parseFormula(formula.leftChild!) +
                " ↔ " +
                parseFormula(formula.rightChild!) +
                ")";
            break;
        case "exquant":
            result +=
                "∃" + formula.varName + ": " + parseFormula(formula.child!);
            break;
        case "allquant":
            result +=
                "∀" + formula.varName + ": " + parseFormula(formula.child!);
            break;
        case "QuantifiedVariable":
            result += formula.spelling!;
            break;
        case "Constant":
            result += formula.spelling!;
            break;
        case "Function":
        case "relation": {
            result += formula.spelling! + "(";
            formula.arguments!.forEach((argument, index) => {
                result += parseFormula(argument);
                if (index !== formula.arguments!.length - 1) {
                    result += ", ";
                }
            });
            result += ")";
            break;
        }
    }

    return result;
};

export const sequentTreeLayout = (
    nodes: SequentNode[],
): TreeLayout<SequentTreeLayoutNode> => {
    return treeLayout(nodes, sequentNodeToTree);
};

/**
 * translates a node to a TreeLayoutNode
 * @param {SequentNode[]} nodes - the node
 * @param {number} i - index in the tree
 * @param {number} y - Y Position
 * @returns {SequentTreeLayoutNode} the tree
 */
const sequentNodeToTree = (
    nodes: SequentNode[],
    i: number = 0,
    y: number = 160,
): Tree<SequentTreeLayoutNode> => {
    const n = nodes[i]!!;

    const width =
        estimateSVGTextWidth(nodeName(n)) +
        56 +
        (n.lastMove === null ? 0 : estimateSVGTextWidth(n.lastMove!.type));

    const resultTree: Tree<SequentTreeLayoutNode> = tree(
        width,
        72,
        y,
        { ...n, id: i },
        [],
    );

    n.children.forEach((childNode) => {
        resultTree.children.push(sequentNodeToTree(nodes, childNode, y - 42));
    });

    return resultTree;
};
