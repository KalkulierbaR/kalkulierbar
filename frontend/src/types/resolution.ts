import { ClauseSet } from "./clause";

export interface ResolutionState {
    seal: string;
    clauseSet: ClauseSet;
}

export interface ResolutionMove {
    c1: number;
    c2: number;
    spelling: string;
}
