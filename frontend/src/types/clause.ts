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
export interface FoLiteral {
    spelling: string;
    arguments: FoArgument[];
}

/**
 * The FoAtom object received from the backend
 */
export interface FoAtom {
    lit: FoLiteral;
    negated: boolean;
}

/**
 * FoClause is a list of FoAtoms
 */
export interface FoClause {
    atoms: FoAtom[];
}

/**
 * Clause sets are sets of Clauses
 */
export interface FoClauseSet {
    clauses: FoClause[];
}

/**
 * An argument in FO
 */
export interface FoArgument {
    type: string;
    spelling: string;
}
