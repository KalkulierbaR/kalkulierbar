/**
 * The Atom object received from the backend
 */
export interface Atom {
    lit: string;
    negated: boolean;
}

/**
 * Clause is a list of Atoms
 */
export interface Clause {
    atoms: Atom[];
}

/**
 * Clause sets are sets of Clauses
 */
export interface ClauseSet {
    clauses: Clause[];
}

/**
 * CandidateClause is a clause that is a candidate for a proof operation
 */
export interface CandidateClause extends Clause {
    atoms: Atom[];
    index: number;
    candidateLiterals: string[];
}

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
export interface FOAtom {
    lit: FOLiteral;
    negated: boolean;
}

/**
 * FOClause is a list of FOAtoms
 */
export interface FOClause {
    atoms: FOAtom[];
}

/**
 * Clause sets are sets of Clauses
 */
export interface FOClauseSet {
    clauses: FOClause[];
}

/**
 * An argument in FO
 */
export interface FOArgument {
    type: string;
    spelling: string;
}

export enum FOArgumentType {
    quantifiedVariable = "kalkulierbar.logic.QuantifiedVariable",
    constant = "kalkulierbar.logic.Constant"
}
