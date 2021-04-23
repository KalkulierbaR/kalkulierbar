import {ResolutionCalculusType} from "../../types/calculus";
import {
    CandidateClause,
    Clause,
    ClauseSet,
    FOLiteral,
    instanceOfFOAtom,
    instanceOfFOClause,
    instanceOfFOClauseSet,
    instanceOfPropAtom,
    instanceOfPropClause,
    instanceOfPropClauseSet,
} from "../../types/calculus/clause";
import {HyperResolutionMove} from "../../types/calculus/resolution";

/**
 * Groups clauses wo are candidates near the selected clause. Keeps order intact where possible
 * @param {Array<CandidateClause>} clauses - the clauses to group
 * @param {number} selectedClauseId - the currently selected group. We will group based on this
 * @returns {void} - nothing
 */
export const groupCandidates = (
    clauses: CandidateClause[],
    selectedClauseId: number,
) => {
    const notCandidates = clauses.filter(
        (c) => c.candidateAtomMap.size === 0 && c.index !== selectedClauseId,
    );
    const candidates = clauses.filter(
        (c) => c.candidateAtomMap.size !== 0 && c.index !== selectedClauseId,
    );

    const indexInCircle = clauses.findIndex(
        (c) => c.index === selectedClauseId,
    );

    const cs = candidates.length;
    const left = indexInCircle - Math.floor(cs / 2);
    const right = left + cs;
    const length = clauses.length;
    let nci = 0;
    let ci = 0;
    for (let i = 0; i < length; i++) {
        if (indexInCircle === i) {
            continue;
        }

        const ml = left + length;
        const mr = right % length;

        if (left >= 0 && right < length) {
            if (i >= left && i <= right) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        }
        // Handle wrap-around
        else if (left >= 0) {
            if ((i >= left && i < length) || i <= mr) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        } else if (right < length) {
            if ((i >= 0 && i <= right) || i >= ml) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        } else {
            // Im 99.9% sure this can't happen. Just in case I am wrong let's log a helpful message
            throw new Error("Daniel made a horrible mistake!");
        }
    }
};

/**
 * Gets the selectable clauses based on the current selection
 * @param {CandidateClause[]} candidateClauses - Current candidate clauses
 * @param {HyperResolutionMove | undefined} hyperRes - Current hyper res move
 * @param {number | undefined} selectedClauseId - Id of the current clause
 * @param {Clause<string | FOLiteral> | undefined} selectedClause - Current clause
 * @returns {number[]} - ids of currently selectable clauses
 */
export const getSelectable = (
    candidateClauses: CandidateClause[],
    hyperRes: HyperResolutionMove | undefined,
    selectedClauseId: number | undefined,
    selectedClause: Clause<string | FOLiteral> | undefined,
): number[] => {
    if (selectedClauseId === undefined || selectedClause === undefined) {
        return candidateClauses.map((c) => c.index);
    }
    if (hyperRes) {
        const cs = candidateClauses.filter((c) => c.candidateAtomMap.size);
        const selectable: number[] = [];

        for (const c of cs) {
            let validKeys = 0;
            for (const k of c.candidateAtomMap.keys()) {
                if (selectedClause.atoms[k].negated) {
                    validKeys++;
                }
            }
            if (validKeys) {
                selectable.push(c.index);
            }
        }
        return selectable;
    }
    return candidateClauses
        .filter((c) => c.candidateAtomMap.size)
        .map((c) => c.index);
};

/**
 * Get the initial candidate clauses
 * @param {ClauseSet<string | FOLiteral>} clauseSet - The clause set to work on
 * @param {ResolutionCalculusType} calculus - The current resolution calculus type
 * @returns {CandidateClause[]} - The new candidate clauses
 */
export const getInitialCandidateClauses = (
    clauseSet: ClauseSet<string | FOLiteral>,
    calculus: ResolutionCalculusType,
) => {
    const newCandidateClauses: CandidateClause[] = [];
    // Create default candidates
    if (instanceOfPropClauseSet(clauseSet, calculus)) {
        clauseSet.clauses.forEach((clause, clauseIndex) => {
            newCandidateClauses[clauseIndex] = {
                clause,
                candidateAtomMap: new Map<number, number[]>(),
                index: clauseIndex,
            };
        });
    } else if (instanceOfFOClauseSet(clauseSet, calculus)) {
        clauseSet.clauses.forEach((clause, clauseIndex) => {
            newCandidateClauses[clauseIndex] = {
                clause,
                candidateAtomMap: new Map<number, number[]>(),
                index: clauseIndex,
            };
        });
    }

    return newCandidateClauses;
};

/**
 * Creates an array of candidate clauses based on if a clause is selected
 * @param {ClauseSet} clauseSet - The clause set
 * @param {CandidateClause[]} clauses - The candidate clauses
 * @param {boolean} group - Whether to help user visually to find resolution partners
 * @param {ResolutionCalculusType} calculus - The current calculus type
 * @param {number} selectedClauseId - Currently selected clause
 * @returns {CandidateClause[]} - The new candidate clauses
 */
export const recalculateCandidateClauses = (
    clauseSet: ClauseSet<string | FOLiteral>,
    clauses: CandidateClause[],
    group: boolean,
    calculus: ResolutionCalculusType,
    selectedClauseId?: number,
) => {
    const newCandidateClauses: CandidateClause[] = [];
    if (selectedClauseId === undefined) {
        // Create default candidates
        if (instanceOfPropClauseSet(clauseSet, calculus)) {
            clauses.forEach((clause, clauseIndex) => {
                newCandidateClauses[clauseIndex] = {
                    clause: clause.clause as Clause,
                    candidateAtomMap: new Map<number, number[]>(),
                    index: clause.index,
                };
            });
        } else if (instanceOfFOClauseSet(clauseSet, calculus)) {
            clauses.forEach((clause, clauseIndex) => {
                newCandidateClauses[clauseIndex] = {
                    clause: clause.clause as Clause<FOLiteral>,
                    candidateAtomMap: new Map<number, number[]>(),
                    index: clause.index,
                };
            });
        }
    } else {
        // Get selected clause
        const selectedClause = clauseSet.clauses[selectedClauseId] as Clause<
            string | FOLiteral
        >;

        // Filter for possible resolve candidates
        clauses.forEach((clause, clauseIndex) => {
            const candidateAtomMap: Map<number, number[]> = new Map<
                number,
                number[]
            >();
            selectedClause.atoms.forEach((atom1, atom1Index) => {
                const resolventAtomIndices: number[] = [];
                (clause.clause as Clause<string | FOLiteral>).atoms.forEach(
                    (atom2, atom2Index) => {
                        if (
                            atom1.negated !== atom2.negated &&
                            ((instanceOfPropAtom(atom1, calculus) &&
                                instanceOfPropAtom(atom2, calculus) &&
                                atom1.lit === atom2.lit) ||
                                (instanceOfFOAtom(atom1, calculus) &&
                                    instanceOfFOAtom(atom2, calculus) &&
                                    atom1.lit.spelling === atom2.lit.spelling &&
                                    atom1.lit.arguments.length ===
                                        atom2.lit.arguments.length))
                        ) {
                            resolventAtomIndices.push(atom2Index);
                        }
                    },
                );
                if (resolventAtomIndices.length > 0) {
                    candidateAtomMap.set(atom1Index, resolventAtomIndices);
                }
            });
            if (
                instanceOfPropClauseSet(clauseSet, calculus) &&
                instanceOfPropClause(clause.clause, calculus)
            ) {
                newCandidateClauses[clauseIndex] = {
                    clause: clause.clause,
                    candidateAtomMap,
                    index: clause.index,
                };
            } else if (
                instanceOfFOClauseSet(clauseSet, calculus) &&
                instanceOfFOClause(clause.clause, calculus)
            ) {
                newCandidateClauses[clauseIndex] = {
                    clause: clause.clause,
                    candidateAtomMap,
                    index: clause.index,
                };
            }
        });

        if (group) {
            groupCandidates(newCandidateClauses, selectedClauseId);
        }
    }
    return newCandidateClauses;
};

/**
 * Add a clause to the clause set
 * @param {ClauseSet<string | FOLiteral>} clauseSet - The clause set to work on
 * @param {CandidateClause[]} clauses - The candidate clauses
 * @param {number} newClauseId - The id of the new clause (might be changed if already occupied)
 * @returns {void}
 */
export const addClause = (
    clauseSet: ClauseSet<string | FOLiteral>,
    clauses: CandidateClause[],
    newClauseId: number,
) => {
    const newClause = clauseSet.clauses[newClauseId];

    let newIndex: number = newClauseId;

    for (let i = 0; i < clauses.length; i++) {
        const c = clauses[i];
        if (c.index === newClauseId) {
            newIndex = i;
        }
        if (c.index >= newClauseId) {
            c.index++;
        }
    }

    clauses.splice(newIndex, 0, {
        clause: newClause as any,
        index: newClauseId,
        candidateAtomMap: new Map(),
    });
};

/**
 * Removes a clause from the candidate clauses
 * @param {CandidateClause[]} clauses - the candidate clauses
 * @param {number} id - id of the clause to remove
 * @returns {void} - void
 */
export const removeClause = (clauses: CandidateClause[], id: number) => {
    let candidateIndex: number = id;

    for (let i = 0; i < clauses.length; i++) {
        const c = clauses[i];
        if (c.index === id) {
            candidateIndex = i;
        }
        if (c.index >= id) {
            c.index--;
        }
    }

    clauses.splice(candidateIndex, 1);
};

/**
 * Replaces a clause from the candidate clauses
 * @param {CandidateClause[]} clauses - the candidate clauses
 * @param {number} id - id of the clause to remove
 * @param {Clause} newClause - the clause to insert
 * @returns {void} - void
 */
export const replaceClause = (
    clauses: CandidateClause[],
    id: number,
    newClause: Clause<string | FOLiteral>,
) => {
    let candidateIndex: number = id;

    for (let i = 0; i < clauses.length; i++) {
        const c = clauses[i];
        if (c.index === id) {
            candidateIndex = i;
        }
    }

    clauses.splice(candidateIndex, 1, {
        clause: newClause as any,
        index: id,
        candidateAtomMap: new Map(),
    });
};
