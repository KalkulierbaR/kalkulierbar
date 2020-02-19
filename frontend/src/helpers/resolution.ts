import { APIInformation, AppState, ResolutionCalculusType } from "../types/app";
import {
    Clause,
    ClauseSet,
    FOCandidateClause,
    FOClause,
    FOClauseSet,
    PropCandidateClause,
} from "../types/clause";
import {
    FOResolutionState,
    HyperResolutionMove,
    PropResolutionState,
    VisualHelp,
} from "../types/resolution";
import { sendMove } from "./api";

/**
 * Groups clauses wo are candidates near the selected clause. Keeps order intact where possible
 * @param {Array<PropCandidateClause>} clauses - the clauses to group
 * @param {number} selectedClauseId - the currently selected group. We will group based on this
 * @returns {void} - nothing
 */
export const groupCandidates = (
    clauses: PropCandidateClause[],
    selectedClauseId: number,
) => {
    const notCandidates = clauses.filter(
        (c) => c.candidateLiterals.length === 0 && c.index !== selectedClauseId,
    );
    const candidates = clauses.filter(
        (c) => c.candidateLiterals.length !== 0 && c.index !== selectedClauseId,
    );

    const cs = candidates.length;
    const left = selectedClauseId - Math.floor(cs / 2);
    const right = left + cs;
    const length = clauses.length;
    let nci = 0;
    let ci = 0;
    for (let i = 0; i < length; i++) {
        if (selectedClauseId === i) {
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

export const getPropHyperCandidates = (
    c1: Clause,
    c2: Clause,
): Array<[number, number]> => {
    const lits: Array<[number, number]> = [];
    for (let i1 = 0; i1 < c1.atoms.length; i1++) {
        const l1 = c1.atoms[i1];
        for (let i2 = 0; i2 < c2.atoms.length; i2++) {
            const l2 = c2.atoms[i2];
            if (l1.lit === l2.lit && l1.negated && !l2.negated) {
                lits.push([i1, i2]);
            }
        }
    }
    return lits;
};

export const getFOHyperCandidates = (
    c1: FOClause,
    c2: FOClause,
): Array<[number, number]> => {
    const lits: Array<[number, number]> = [];
    for (let i1 = 0; i1 < c1.atoms.length; i1++) {
        const l1 = c1.atoms[i1];
        for (let i2 = 0; i2 < c2.atoms.length; i2++) {
            const l2 = c2.atoms[i2];
            if (
                l1.negated &&
                !l2.negated &&
                l1.lit.spelling === l2.lit.spelling &&
                l1.lit.arguments.length === l2.lit.arguments.length
            ) {
                lits.push([i1, i2]);
            }
        }
    }
    return lits;
};

export const addHyperSidePremiss = (
    hyperRes: HyperResolutionMove,
    mainLitId: number,
    clauseId: number,
    litId: number,
): HyperResolutionMove => ({
    ...hyperRes,
    sidePremisses: {
        ...hyperRes.sidePremisses,
        [mainLitId]: { first: clauseId, second: litId },
    },
});

/**
 * Creates an array of candidate clauses based on if a clause is selected
 * @param {ClauseSet} clauseSet - The clause set
 * @param {VisualHelp} visualHelp - Whether to help user visually to find resolution partners
 * @param {number} selectedClauseId - Currently selected clause
 * @returns {PropCandidateClause[]} - The new candidate clauses
 */
export const getPropCandidateClauses = (
    clauseSet: ClauseSet,
    visualHelp: VisualHelp,
    selectedClauseId?: number,
) => {
    const newCandidateClauses: PropCandidateClause[] = [];

    if (selectedClauseId === undefined) {
        // Create default candidates
        clauseSet.clauses.forEach((clause, index) => {
            newCandidateClauses[index] = {
                clause,
                candidateLiterals: [],
                index,
            };
        });
    } else {
        // Get selected clause
        const selectedClause = clauseSet.clauses[selectedClauseId];

        // Filter for possible resolve candidates
        clauseSet.clauses.forEach((clause, index) => {
            const literals: number[] = [];
            selectedClause.atoms.forEach((atom1) => {
                clause.atoms.forEach((atom2, atomIndex) => {
                    if (
                        atom1.lit === atom2.lit &&
                        atom1.negated !== atom2.negated
                    ) {
                        literals.push(atomIndex);
                    }
                });
            });
            newCandidateClauses[index] = {
                clause,
                candidateLiterals: literals,
                index,
            };
        });

        if (visualHelp === VisualHelp.rearrange) {
            groupCandidates(newCandidateClauses, selectedClauseId);
        }
    }
    return newCandidateClauses;
};

/**
 * Creates an array of candidate clauses based on if a clause is selected
 * @param {FOClauseSet} clauseSet - The clause set to work on
 * @param {VisualHelp} visualHelp - Whether to help user visually to find resolution partners
 * @param {number} selectedClauseId - The selected clause
 * @returns {FOCandidateClause[]} - The new candidate clauses
 */
export const getFOCandidateClauses = (
    clauseSet: FOClauseSet,
    visualHelp: VisualHelp,
    selectedClauseId?: number,
) => {
    const newCandidateClauses: FOCandidateClause[] = [];
    if (selectedClauseId === undefined) {
        // Create default candidates
        clauseSet.clauses.forEach((clause, index) => {
            newCandidateClauses[index] = {
                clause,
                candidateLiterals: [],
                index,
            };
        });
    } else {
        // Get selected clause
        const selectedClause = clauseSet.clauses[selectedClauseId];

        // Filter for possible resolve candidates
        clauseSet.clauses.forEach((clause, index) => {
            const literals: number[] = [];
            selectedClause.atoms.forEach((atom1) => {
                clause.atoms.forEach((atom2, atomIndex) => {
                    if (
                        atom1.negated !== atom2.negated &&
                        atom1.lit.spelling === atom2.lit.spelling &&
                        atom1.lit.arguments.length ===
                            atom2.lit.arguments.length
                    ) {
                        literals.push(atomIndex);
                    }
                });
            });
            newCandidateClauses[index] = {
                clause,
                candidateLiterals: literals,
                index,
            };
        });

        if (visualHelp === VisualHelp.rearrange) {
            // groupCandidates(newCandidateClauses, selectedClauseId);
        }
    }
    return newCandidateClauses;
};

export const sendResolve = (
    c1: number,
    c2: number,
    literal: string | null,
    { server, state, onChange, onError }: APIInformation<PropResolutionState>,
) =>
    sendMove(
        server,
        "prop-resolution",
        state,
        { type: "res-resolve", c1, c2, literal },
        onChange,
        onError,
    );

export const sendResolveUnify = (
    c1: number,
    c2: number,
    l1: number,
    l2: number,
    { server, state, onChange, onError }: APIInformation<FOResolutionState>,
) =>
    sendMove(
        server,
        "fo-resolution",
        state,
        { type: "res-resolveunify", c1, c2, l1, l2 },
        onChange,
        onError,
    );

/**
 * The function to call when the user hides a clause
 * @param {number} clauseId - The id of the clause to hide
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @returns {void}
 */
export const hideClause = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    clauseId: number,
    calculus: ResolutionCalculusType,
    { server, state, onChange, onError }: APIInformation<AppState[C]>,
) => {
    // Send hide move to backend
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-hide",
            c1: clauseId,
        },
        onChange,
        onError,
    );
};

/**
 * The function to call when the user wants to re-show hidden clauses
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @returns {void}
 */
export const showHiddenClauses = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    calculus: ResolutionCalculusType,
    { server, state, onChange, onError }: APIInformation<AppState[C]>,
) => {
    // Send show move to backend
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-show",
        },
        onChange,
        onError,
    );
};
