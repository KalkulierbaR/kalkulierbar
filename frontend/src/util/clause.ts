import {
    Atom,
    CandidateClause,
    Clause,
    ClauseSet,
    FOArgument,
    FOArgumentType,
    FOAtom,
    FOLiteral,
} from "../types/clause";
import { FORelation } from "../types/tableaux";
import { stringArrayToStringMap } from "./array-to-map";
import { maxBy } from "./max-by";

/**
 * Parse a First Order argument to a string
 * @param {FOArgument} arg - The FO argument to parse
 * @returns {string} - The string representation
 */
export const FOArgumentToString = (arg: FOArgument): string =>
    arg.arguments
        ? `${arg.spelling}(${arg.arguments.map(FOArgumentToString).join(", ")})`
        : arg.spelling;

/**
 * Parse a First Order literal to a string
 * @param {FOLiteral} lit - The FO literal to parse
 * @returns {string} - The string representation
 */
export const FOLitToString = (lit: FOLiteral): string =>
    `${lit.spelling}(${lit.arguments.map(FOArgumentToString).join(", ")})`;

/**
 *
 * @param {Atom} atom - atom to format
 * @returns {string} - formatted atom
 */
export const atomToString = (atom: Atom<string | FOLiteral>) =>
    `${atom.negated ? "¬" : ""}${
        typeof atom.lit === "string" ? atom.lit : FOLitToString(atom.lit)
    }`;

/**
 *
 * @param {Clause} clause - clause to format
 * @returns {string} - formatted clause
 */
export const clauseToString = (clause: Clause<string | FOLiteral>) => {
    if (clause.atoms.length === 0) {
        return "∅";
    }
    return clause.atoms.map(atomToString).join(", ");
};

/**
 * Transforms a clause set to a string array
 * @param {ClauseSet} clauseSet - A set of clauses
 * @returns {string[]} - The clauses as string array
 */
export const clauseSetToStringArray = (
    clauseSet: ClauseSet<string | FOLiteral>,
) => clauseSet.clauses.map(clauseToString);

/**
 * Transforms a clause set to a string map
 * @param {ClauseSet} clauseSet - A set of clauses
 * @returns {Map<number, string>} - The clauses as string map
 */
export const clauseSetToStringMap = (
    clauseSet: ClauseSet<string | FOLiteral>,
) => stringArrayToStringMap(clauseSetToStringArray(clauseSet));

/**
 * Determine the longest clause
 * @param {Clause[]} clauses - The clauses
 * @returns {Clause} - The longest clause
 */
export const maxLengthClause = (clauses: Clause<string | FOLiteral>[]) =>
    maxBy(clauses, (c) => clauseToString(c).length);

/**
 * Get a candidate clause matching the index property
 * @param {number} searchIndex - The index to search for
 * @param {CandidateClause[]} candidateClauses - The candidates to search in
 * @returns {CandidateClause | null} - The candidate clause matching the index
 */
export const getCandidateClause = (
    searchIndex: number,
    candidateClauses: CandidateClause[],
) => {
    const candidateClauseHits = candidateClauses.filter(
        (c) => c.index === searchIndex,
    );
    if (candidateClauseHits.length === 1) {
        return candidateClauseHits[0];
    }
    return null;
};

/**
 * Check an array of FO Relations for vars to assign
 * @param {FORelation[]} relations - The relations to search in
 * @returns {string[]} - The vars found
 */
export const checkRelationsForVar = (relations: FORelation[]) => {
    const vars: string[] = [];

    const checkArgumentForVar = (argument: FOArgument) => {
        if (argument.type === FOArgumentType.quantifiedVariable) {
            vars.push(argument.spelling);
        }
        if (argument.arguments) {
            argument.arguments.forEach(checkArgumentForVar);
        }
    };
    relations.forEach((relation) => {
        relation.arguments.forEach(checkArgumentForVar);
    });

    return vars;
};

/**
 * Check an array of FO Atoms for vars to assign
 * @param {FOAtom[]} atoms - The atoms to search in
 * @returns {string[]} - The vars found
 */
export const checkAtomsForVar = (atoms: FOAtom[]) => {
    const vars: string[] = [];

    const checkArgumentForVar = (argument: FOArgument) => {
        if (argument.type === FOArgumentType.quantifiedVariable) {
            vars.push(argument.spelling);
        }
        if (argument.arguments) {
            argument.arguments.forEach(checkArgumentForVar);
        }
    };
    atoms.forEach((atom) => {
        atom.lit.arguments.forEach(checkArgumentForVar);
    });

    return vars;
};
