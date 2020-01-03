import { Atom, Clause } from "../types/clause";

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
    if(clause.atoms.length === 0){
        return "∅";
    }
    return clause.atoms.map(atomToString).join(", ");
};