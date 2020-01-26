import { ClauseSet } from "./clause";

export interface TableauxNode {
    parent: number | null;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
}

export type TableauxTreeLayoutNode = TableauxNode & { id: number};

export interface PropTableauxState {
    seal: string;
    clauseSet: ClauseSet;
    nodes: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    undoEnable: boolean;
    moveHistory: TableauxMove[];
    usedUndo: boolean;
}

export interface FoTableauxState extends PropTableauxState {
    manualVarAssign: boolean;
    renderedClauseSet: string[];
    relation: FoRelation;
}

export interface FoRelation {
    spelling: string;
    arguments: [];
}

export function instanceOfFoTableauxState(object: any): object is FoTableauxState {
    return 'manualVarAssign' in object;
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
    varAssign?: Map<string, string>;
}

export interface TableauxUndoMove {
    type: "UNDO";
    id1: number;
    id2: number;
}

export type TableauxMove = TableauxExpandMove | TableauxCloseMove | TableauxUndoMove;

export enum TableauxType {
    unconnected = "UNCONNECTED",
    weak = "WEAKLYCONNECTED",
    strong = "STRONGLYCONNECTED"
}

export enum CnfStrategy {
    optimal = "OPTIMAL",
    naive = "NAIVE",
    tseytin = "TSEYTIN"
}

export interface PropTableauxParams {
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    cnfStrategy: CnfStrategy;
}

export interface FoTableauxParams {
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    manualUnification: boolean;
}

export interface SelectNodeOptions {
    /**
     * Ignores any selected clause and deselects all clauses.
     * Defaults to `false`.
     */
    ignoreClause?: boolean;
}
