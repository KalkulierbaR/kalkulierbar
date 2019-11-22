import { Atom, Clause } from "../types/clause";

export const atomToString = (atom: Atom) =>
    `${atom.negated ? "!" : ""}${atom.lit}`;

export const clauseToString = (clause: Clause) =>
    clause.atoms.map(atomToString).join(", ");
