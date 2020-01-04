import { ClauseSet } from "./clause";
import { CnfStrategy } from "./tableaux";

export interface ResolutionState {
    seal: string;
    clauseSet: ClauseSet;
    highlightSelectable: boolean;
}

export interface ResolutionMove {
    c1: number;
    c2: number;
    spelling: string;
}

export interface ResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}
