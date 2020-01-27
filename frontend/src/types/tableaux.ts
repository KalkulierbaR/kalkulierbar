import {ClauseSet, FoClauseSet} from "./clause";

export interface TableauxNode {
    parent: number | null;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
    relation?: FoRelation;
}

export type TableauxTreeLayoutNode = TableauxNode & { id: number};

export interface PropTableauxState {
    seal: string;
    clauseSet: ClauseSet;
    nodes: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    moveHistory: TableauxMove[];
    usedBacktracking: boolean;
}

export function instanceOfPropTableauxState(object: any): object is PropTableauxState {
    return 'clauseSet' in object;
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

export interface SelectNodeOptions {
    /**
     * Ignores any selected clause and deselects all clauses.
     * Defaults to `false`.
     */
    ignoreClause?: boolean;
}

export interface FoTableauxState {
    seal: string;
    clauseSet: FoClauseSet;
    nodes: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    moveHistory: TableauxMove[];
    usedBacktracking: boolean;
    formula: string;
    expansionCounter: number;
    manualVarAssign: boolean;
    renderedClauseSet: string[];
}

export function instanceOfFoTableauxState(object: any): object is FoTableauxState {
    return 'formula' in object;
}


export interface FoRelation {
    spelling: string;
    arguments: [];
}

export interface FoTableauxParams {
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    manualUnification: boolean;
}