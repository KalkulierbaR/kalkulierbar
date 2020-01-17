import { Atom, Clause } from "../types/clause";
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
 * Determine the longest clause
 * @param {Clause[]} clauses - The clauses
 * @returns {Clause} - The longest clause
 */
export const maxLengthClause = (clauses: readonly Clause[]) =>
    maxBy(clauses, c => clauseToString(c).length);
