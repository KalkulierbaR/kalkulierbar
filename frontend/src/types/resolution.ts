import { ClauseSet } from "./clause";
import { CnfStrategy } from "./tableaux";

export interface ResolutionState {
    seal: string;
    clauseSet: ClauseSet;
    highlightSelectable: boolean;
    newestNode: number;
}

export interface ResolutionMove {
    c1: number;
    c2: number;
    spelling: string | null;
}

export interface ResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}
