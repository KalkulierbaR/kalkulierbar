import { VarAssign } from "./tableaux";

export interface NCTableauxState {
    formula: LogicNode;
    backtracking: boolean;
    nodes: NCTableauxNode[];
    moveHistory: NCTableauxMove[];
    usedBacktracking: boolean;
    seal: string;
}

export interface LogicNode {}

export interface NCTableauxNode {
    parent: number | null;
    formula: LogicNode;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
    spelling: string;
}

export interface NCTabAlphaMove {
    type: "alpha";
    leafID: number;
}

export interface NCTabBetaMove {
    type: "beta";
    leafID: number;
}

export interface NCTabGammaMove {
    type: "gamma";
    leafID: number;
}

export interface NCTabDeltaMove {
    type: "delta";
    leafID: number;
}

export interface NCTabCloseMove {
    type: "alpha";
    leafID: number;
    closeID: number;
    varAssign: VarAssign | null;
}

export interface NCTabUndoMove {
    type: "undo";
}

export type NCTableauxMove =
    | NCTabAlphaMove
    | NCTabBetaMove
    | NCTabGammaMove
    | NCTabDeltaMove
    | NCTabCloseMove
    | NCTabUndoMove;
