import { KStringMap } from "../kotlin";

import { Calculus, TableauxCalculusType } from ".";
import { ClauseSet, FOArgument, FOClauseSet } from "./clause";

export interface TableauxNode {
    parent: number | null;
    spelling: string;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
    relation?: FORelation;
    lemmaSource?: number;
}

export type TableauxTreeLayoutNode = TableauxNode & { id: number };

export interface PropTableauxState {
    seal: string;
    clauseSet: ClauseSet;
    tree: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    moveHistory: TableauxMove[];
    usedBacktracking: boolean;
}

export function instanceOfPropTabState(
    object: any,
    calculus: TableauxCalculusType,
): object is PropTableauxState {
    return "clauseSet" in object && calculus === Calculus.propTableaux;
}

export interface TableauxExpandMove {
    type: "tableaux-expand";
    id1: number;
    id2: number;
}

export interface TableauxCloseMove {
    type: "tableaux-close";
    id1: number;
    id2: number;
}

export interface TableauxUndoMove {
    type: "tableaux-undo";
}

export interface TableauxLemmaMove {
    type: "tableaux-lemma";
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
    strong = "STRONGLYCONNECTED",
}

export enum CnfStrategy {
    optimal = "OPTIMAL",
    naive = "NAIVE",
    tseytin = "TSEYTIN",
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
    tree: TableauxNode[];
    type: TableauxType;
    regular: boolean;
    backtracking: boolean;
    moveHistory: FOTableauxMove[];
    usedBacktracking: boolean;
    formula: string;
    expansionCounter: number;
    manualVarAssign: boolean;
    renderedClauseSet: string[];
    statusMessage: string | null;
}

export function instanceOfFOTabState(
    object: any,
    calculus: TableauxCalculusType,
): object is FOTableauxState {
    return "formula" in object && calculus === Calculus.foTableaux;
}

export type VarAssign = KStringMap<string>;

export interface TableauxCloseAssignMove {
    type: "tableaux-close-assign";
    id1: number;
    id2: number;
    varAssign: VarAssign;
}

export type FOTableauxMove = TableauxMove | TableauxCloseAssignMove;

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
