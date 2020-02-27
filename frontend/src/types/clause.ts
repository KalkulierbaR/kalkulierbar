import {FOCalculus, PropCalculus} from "./app";

/**
 * The Atom object received from the backend
 */
export interface Atom<L = string> {
    lit: L;
    negated: boolean;
}

export function instanceOfPropAtom(
    object: any,
    calculus: any,
): object is Atom<string> {
    return "lit" in object && PropCalculus.includes(calculus);
}

export function instanceOfFOAtom(
    object: any,
    calculus: any,
): object is Atom<FOLiteral> {
    return "lit" in object && FOCalculus.includes(calculus);
}

/**
 * Clause is a list of Atoms
 */
export interface Clause<L = string> {
    atoms: Array<Atom<L>>;
}

export function instanceOfPropClause(
    object: any,
    calculus: any,
): object is Clause<string> {
    return "atoms" in object && PropCalculus.includes(calculus);
}

export function instanceOfFOClause(
    object: any,
    calculus: any,
): object is Clause<FOLiteral> {
    return "atoms" in object && FOCalculus.includes(calculus);
}

/**
 * Clause sets are sets of Clauses
 */
export interface ClauseSet<L = string> {
    clauses: Array<Clause<L>>;
}

export function instanceOfPropClauseSet(
    object: any,
    calculus: any,
): object is ClauseSet<string> {
    return "clauses" in object && PropCalculus.includes(calculus);
}

export function instanceOfFOClauseSet(
    object: any,
    calculus: any,
): object is ClauseSet<FOLiteral> {
    return "clauses" in object && FOCalculus.includes(calculus);
}

/**
 * BaseCandidateClause is a clause that is a candidate for a proof operation
 */
export interface BaseCandidateClause<L> {
    clause: Clause<L>;
    index: number;
    candidateAtomMap: Map<number, number[]>;
}

export function getCandidateCount(clause: BaseCandidateClause<any>) {
    let length = 0;
    clause.candidateAtomMap.forEach((atomIndices) => length += atomIndices.length);
    return length;
}

/**
 * PropCandidateClause is a propositional clause that is a candidate for a proof operation
 */
export type PropCandidateClause = BaseCandidateClause<string>;

export function instanceOfPropCandidateClause(
    object: any,
    calculus: any,
): object is PropCandidateClause {
    return "clause" in object && PropCalculus.includes(calculus);
}

/**
 * FOCandidateClause is a FO clause that is a candidate for a proof operation
 */
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
    quantifiedVariable = "QuantifiedVariable",
    constant = "Constant",
    function = "Function",
}

export type SelectedClauses = undefined | [number] | [number, number];
