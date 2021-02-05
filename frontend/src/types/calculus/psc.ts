import { RuleSet } from "./rules";
import { PropCalculusType, Calculus } from ".";
import { VarAssign } from "./tableaux";

export interface PSCNode {
    type: string;
    parent: number | null;
    children: number[];
    leftFormulas: FormulaNode[];
    rightFormulas: FormulaNode[];
    isClosed: boolean;
    lastMove: PSCMove | null;
}

export interface FormulaNode {
    type: string;
    child: FormulaNode | null;
    leftChild: FormulaNode | null;
    rightChild: FormulaNode | null;
    spelling: string | null;
}

export type PSCTreeLayoutNode = PSCNode & { id: number};

export type FormulaTreeLayoutNode = FormulaNode & { id: string};

export interface PSCState {
    tree: PSCNode[];
    moveHistory: PSCMove[];
}
export interface FOSCState{
    tree: PSCNode[];
    moveHistory: PSCMove[];
}

export function instanceOfPSCState(
    object: any,
    calculus: PropCalculusType,
): object is PSCState {
    return "ruleSet" in object && calculus === Calculus.psc;
}

export type PSCMove =
    PSCAxMove | PSCRuleMove | PSCUndoMove | PSCPruneMove;

export type FOSCMove = PSCMove | SCCloseAssignMove;

export interface SCCloseAssignMove{
    type:"psc-close-assign";
    id1: number;
    id2: number;
    varAssign: VarAssign;
}
export interface PSCRuleMove {
    type: string
    nodeID: number;
    listIndex: number;
}

export interface PSCAxMove {
    type: "Ax";
    nodeID: number;
}

export interface PSCUndoMove {
    type: "undo";
}

export interface PSCPruneMove {
    type: "prune"
    nodeID: number;
}

export enum PSCType {
    help = "HELP"
}

export interface PSCParams {
    showOnlyApplicableRules: boolean;
}