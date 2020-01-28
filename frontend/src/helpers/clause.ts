import { Atom, Clause, ClauseSet } from "../types/clause";
import { maxBy } from "./max-by";

/**
 *
 * @param {Atom} atom - atom to format
 * @returns {string} - formatted atom
 */
export const atomToString = (atom: Atom) =>
    `${atom.negated ? "¬" : ""}${atom.lit}`;

/**
 *
 * @param {Clause} clause - clause to format
 * @returns {string} - formatted clause
 */
export const clauseToString = (clause: Clause) => {
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
export const clauseSetToStringArray = (clauseSet: ClauseSet) =>
    clauseSet.clauses.map(clauseToString);

/**
 * Determine the longest clause
 * @param {Clause[]} clauses - The clauses
 * @returns {Clause} - The longest clause
 */
export const maxLengthClause = (clauses: readonly Clause[]) =>
    maxBy(clauses, c => clauseToString(c).length);
