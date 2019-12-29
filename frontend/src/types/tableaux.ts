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
    type: TableauxType;
    regular: boolean;
}

export interface TableauxExpandMove {
    type: "EXPAND";
    id1: number;
    id2: number;
}

export interface TableauxCloseMove {
    type: "CLOSE";
    id1: number;
    id2: number;
}

export interface TableauxUndoMove {
    type: "UNDO";
}

export type TableauxMove =
    | TableauxExpandMove
    | TableauxCloseMove
    | TableauxUndoMove;

export enum TableauxType {
    unconnected = "UNCONNECTED",
    weak = "WEAKLYCONNECTED",
    strong = "STRONGLYCONNECTED"
}

export interface TableauxParams {
    type: TableauxType;
    regular: boolean;
}

export interface TableauxTreeGoToEvent extends CustomEvent {
    detail: {
        node: number;
    };
}

export interface SelectNodeOptions {
    /**
     * Ignores any selected clause and deselects all clauses.
     * Defaults to `false`.
     */
    ignoreClause?: boolean;
}
