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
    seal: string;
    clauseSet: ClauseSet;
    nodes: TableauxNode[];
}

export interface TableauxMove {
    type: "c" | "e";
    id1: number;
    id2: number;
}

export enum TableauxType {
    unconncted = "UNCONNECTED",
    weak = "WEAKLYCONNECTED",
    strong = "STRONGLYCONNECTED"
}
