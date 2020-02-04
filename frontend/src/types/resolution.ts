import { ClauseSet } from "./clause";
import { CnfStrategy } from "./tableaux";

export interface ResolutionState {
    seal: string;
    clauseSet: ClauseSet;
    highlightSelectable: boolean;
    newestNode: number;
}

export interface ResolutionMoveResolve {
    type: string;
    c1: number;
    c2: number;
    literal: string | null;
}

export interface ResolutionMoveHide {
    type: string;
    c1: number;
}

export interface ResolutionMoveShow {
    type: string;
}

export interface ResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}
