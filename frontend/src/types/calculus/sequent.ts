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
    lastMove: PSCMove | null;
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

export type SequentTreeLayoutNode = SequentNode & { id: number };

export type FormulaTreeLayoutNode = FormulaNode & { id: string };

export type VarAssign = KStringMap<string>;

export interface PSCState {
    tree: SequentNode[];
    moveHistory: PSCMove[];
    showOnlyApplicableRules: boolean;
}
export interface FOSCState {
    tree: SequentNode[];
    moveHistory: PSCMove[];
    showOnlyApplicableRules: boolean;
}

export function instanceOfPSCState(
    object: any,
    calculus: SequentCalculusType,
): object is PSCState {
    return "tree" in object && calculus === Calculus.propSequent;
}
export function instanceOfFOSCState(
    object: any,
    calculus: SequentCalculusType,
): object is FOSCState {
    return "tree" in object && calculus === Calculus.foSequent;
}

export type PSCMove =
    | SequentAxMove
    | SequentRuleMove
    | SequentUndoMove
    | SequentPruneMove;

export type FOSCMove = PSCMove | SCCloseAssignMove;

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
