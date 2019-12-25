import { ClauseSet } from "./clause";

export interface ResolutionState {
    seal: string;
    clauseSet: ClauseSet;
}

export interface ResolutionMove {
    id1: number;
    id2: number;
    spelling: string;
}
