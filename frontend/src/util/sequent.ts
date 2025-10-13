import {
    FormulaNode,
    FormulaTreeLayoutNode,
    SequentNode,
    SequentTreeLayoutNode,
} from "../types/calculus/sequent";
import { Tree, TreeLayout } from "../types/tree";

import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

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

const NODE_PADDING = 16;

/**
 * translates a node to a TreeLayoutNode
 * @param {SequentNode[]} nodes - the node
 * @param {number} i - index in the tree
 * @param {number} y - Y Position
 * @returns {SequentTreeLayoutNode} the tree
 */
const sequentNodeToTree = (
    nodes: SequentNode[],
    i = 0,
    y = 160,
): Tree<SequentTreeLayoutNode> => {
    const n = nodes[i]!;

    const height = 8;

    const antecedent: FormulaTreeLayoutNode[] = [];
    let x = 0;
    for (let j = 0; j < n.leftFormulas.length; ++j) {
        const a = n.leftFormulas[j];
        const text = parseFormula(a);
        const width = estimateSVGTextWidth(text);
        const paddedWidth = width + NODE_PADDING;
        antecedent.push({
            id: `l${j}`,
            text,
            width,
            height,
            y,
            x: x + paddedWidth / 2,
        });
        x += paddedWidth;
    }
    const tsWidth = estimateSVGTextWidth("⊢");
    const turnstyle = { x: x + tsWidth / 2, y, height, width: tsWidth };
    x += tsWidth;
    const succedent: FormulaTreeLayoutNode[] = [];
    for (let j = 0; j < n.rightFormulas.length; ++j) {
        const s = n.rightFormulas[j];
        const text = parseFormula(s);
        const width = estimateSVGTextWidth(text);
        const paddedWidth = width + NODE_PADDING;
        succedent.push({
            id: `r${j}`,
            text,
            width,
            height,
            y,
            x: x + paddedWidth / 2,
        });
        x += paddedWidth;
    }

    const resultTree: Tree<SequentTreeLayoutNode> = tree(
        x + 16,
        72,
        y,
        { ...n, id: i, antecedent, succedent, turnstyle, width: x },
        [],
    );

    n.children.forEach((childNode) => {
        resultTree.children.push(sequentNodeToTree(nodes, childNode, y - 42));
    });

    return resultTree;
};
