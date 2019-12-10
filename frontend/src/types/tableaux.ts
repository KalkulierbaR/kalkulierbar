import { ClauseSet } from "./clause";

export interface TableauxNode {
    parent: number | null;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
}

export interface TableauxState {
    seal: string;
    clauseSet: ClauseSet;
    nodes: TableauxNode[];
}

export interface TableauxMove {
    type: "c" | "e";
    id1: number;
    id2: number;
}
