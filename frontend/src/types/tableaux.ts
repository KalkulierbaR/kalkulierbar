import { ClauseSet, FOArgument, FOClauseSet } from "./clause";

export interface TableauxNode {
    parent: number | null;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
    relation?: FORelation;
}

export type TableauxTreeLayoutNode = TableauxNode & { id: number };

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

export function instanceOfPropTableauxState(
    object: any
): object is PropTableauxState {
    return "clauseSet" in object;
}

export interface TableauxExpandMove {
    type: "EXPAND";
    id1: number;
    id2: number;
}

export interface TableauxCloseMove {
    type: "CLOSE" | "AUTOCLOSE";
    id1: number;
    id2: number;
}

export interface TableauxUndoMove {
    type: "UNDO";
    id1: number;
    id2: number;
}

export interface TableauxLemmaMove {
    type: "LEMMA";
    id1: number;
    id2: number;
}

export type TableauxMove =
    | TableauxExpandMove
    | TableauxCloseMove
    | TableauxUndoMove
    | TableauxLemmaMove;

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

export interface FOTableauxState {
    seal: string;
    clauseSet: FOClauseSet;
    nodes: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    moveHistory: FOTableauxMove[];
    usedBacktracking: boolean;
    formula: string;
    expansionCounter: number;
    manualVarAssign: boolean;
    renderedClauseSet: string[];
}

export function instanceOfFOTableauxState(
    object: any
): object is FOTableauxState {
    return "formula" in object;
}

export interface VarAssign {
    [key: string]: string;
}

export type FOTableauxMove = TableauxMove & { varAssign: VarAssign };

export interface FORelation {
    spelling: string;
    arguments: FOArgument[];
}

export interface FOTableauxParams {
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    manualVarAssign: boolean;
}
