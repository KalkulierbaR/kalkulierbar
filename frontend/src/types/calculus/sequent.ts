import { KStringMap } from "../kotlin";

import { Calculus, SequentCalculusType } from ".";

/* eslint "@typescript-eslint/no-explicit-any": "off" */

export type SequentNodeType = "";

export interface SequentNode {
    type: "TreeNode";
    parent: number | null;
    children: number[];
    leftFormulas: FormulaNode[];
    rightFormulas: FormulaNode[];
    isClosed: boolean;
    lastMove: PropSequentMove | null;
}

export interface FormulaNode {
    type: string;
    varName: string | null;
    child: FormulaNode | null;
    leftChild: FormulaNode | null;
    rightChild: FormulaNode | null;
    spelling: string | null;
    arguments: FormulaNode[] | null;
}

export interface Turnstyle {
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface SequentTreeLayoutNode {
    id: number;
    parent: number | null;
    antecedent: FormulaTreeLayoutNode[];
    turnstyle: Turnstyle;
    succedent: FormulaTreeLayoutNode[];
    width: number;
    isClosed: boolean;
    lastMove: PropSequentMove | null;
}

export interface FormulaTreeLayoutNode {
    id: string;
    text: string;
    width: number;
    height: number;
    x: number;
    y: number;
}

export type VarAssign = KStringMap<string>;

export interface PropSequentState {
    tree: SequentNode[];
    moveHistory: PropSequentMove[];
    showOnlyApplicableRules: boolean;
}
export interface FOSequentState {
    tree: SequentNode[];
    moveHistory: PropSequentMove[];
    showOnlyApplicableRules: boolean;
}

export function instanceOfPropSequentState(
    object: any,
    calculus: SequentCalculusType,
): object is PropSequentState {
    return "tree" in object && calculus === Calculus.propSequent;
}
export function instanceOfFOSequentState(
    object: any,
    calculus: SequentCalculusType,
): object is FOSequentState {
    return "tree" in object && calculus === Calculus.foSequent;
}

export type PropSequentMove =
    | SequentAxMove
    | SequentRuleMove
    | SequentUndoMove
    | SequentPruneMove;

export type FOSequentMove = PropSequentMove | SCCloseAssignMove;

export interface SCCloseAssignMove {
    type: string;
    nodeID: number;
    listIndex: number;
    instTerm: string | null;
}
export interface SequentRuleMove {
    type: string;
    nodeID: number;
    listIndex: number;
}

export interface SequentAxMove {
    type: "Ax";
    nodeID: number;
}

export interface SequentUndoMove {
    type: "undo";
}

export interface SequentPruneMove {
    type: "prune";
    nodeID: number;
}

export interface SequentParams {
    showOnlyApplicableRules: boolean;
}
