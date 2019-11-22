export interface Atom {
    lit: string;
    negated: boolean;
}

export interface Clause {
    atoms: Atom[];
}

export interface ClauseSet {
    clauses: Clause[];
}
