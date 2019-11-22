import { ClauseSet } from "./clause";

export interface TableauxNode {
    parent: number;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
}

export interface TableauxState {
    idCounter: number;
    seal: string;
    clauseSet: ClauseSet;
    nodes: TableauxNode[];
}
