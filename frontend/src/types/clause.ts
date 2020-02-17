/**
 * The Atom object received from the backend
 */
export interface Atom<L = string> {
    lit: L;
    negated: boolean;
}

/**
 * Clause is a list of Atoms
 */
export interface Clause<L = string> {
    atoms: Array<Atom<L>>;
}

export function instanceOfStringClause(
    object: any
): object is Clause<string> {
    return "atoms" in object;
}

/**
 * Clause sets are sets of Clauses
 */
export interface ClauseSet<L = string> {
    clauses: Array<Clause<L>>;
}

export interface BaseCandidateClause<L> {
    clause: Clause<L>;
    index: number;
    candidateLiterals: number[];
}

/**
 * CandidateClause is a clause that is a candidate for a proof operation
 */
export type PropCandidateClause = BaseCandidateClause<string>;

export type FOCandidateClause = BaseCandidateClause<FOLiteral>;

export type CandidateClause = PropCandidateClause | FOCandidateClause;

/**
 * A literal in FO
 */
export interface FOLiteral {
    spelling: string;
    arguments: FOArgument[];
}

/**
 * The FOAtom object received from the backend
 */
export type FOAtom = Atom<FOLiteral>;

/**
 * FOClause is a list of FOAtoms
 */
export type FOClause = Clause<FOLiteral>;

/**
 * Clause sets are sets of Clauses
 */
export type FOClauseSet = ClauseSet<FOLiteral>;

/**
 * An argument in FO
 */
export interface FOArgument {
    type: string;
    spelling: string;
    arguments?: FOArgument[];
}

export enum FOArgumentType {
    quantifiedVariable = "kalkulierbar.logic.QuantifiedVariable",
    constant = "kalkulierbar.logic.Constant",
    function = "kalkulierbar.logic.Function",
}
