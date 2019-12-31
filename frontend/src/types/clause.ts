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
    id: number;
    atoms: Atom[];
    candidateLiterals: string[];
}