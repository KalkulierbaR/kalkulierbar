import {
    APIInformation,
    AppState,
    Calculus,
    ResolutionCalculusType,
} from "../types/app";
import {
    Atom,
    CandidateClause,
    Clause,
    ClauseSet,
    FOClause,
    FOLiteral,
    instanceOfFOAtom,
    instanceOfFOClause,
    instanceOfFOClauseSet,
    instanceOfPropAtom,
    instanceOfPropClause,
    instanceOfPropClauseSet,
} from "../types/clause";
import {
    FOResolutionState,
    HyperResolutionMove,
    PropResolutionState,
    VisualHelp,
} from "../types/resolution";
import { VarAssign } from "../types/tableaux";
import { sendMove } from "./api";

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
 * Gets a list of possible literal combination for prop. hyper-res
 * @param {Clause} c1 - Main hyper-res clause
 * @param {Clause} c2 - Possible side premiss
 * @returns {Array<[number, number]>} - List of lit combinations
 */
export const getPropHyperCandidates = (
    c1: Clause,
    c2: Clause,
): Array<[number, number]> => {
    const lits: Array<[number, number]> = [];
    const strings: string[] = [];

    for (let i1 = 0; i1 < c1.atoms.length; i1++) {
        const l1 = c1.atoms[i1];
        for (let i2 = 0; i2 < c2.atoms.length; i2++) {
            const l2 = c2.atoms[i2];
            if (
                l1.lit === l2.lit &&
                l1.negated &&
                !l2.negated &&
                !strings.includes(l2.lit)
            ) {
                lits.push([i1, i2]);
                strings.push(l2.lit);
            }
        }
    }
    return lits;
};

/**
 * Gets a list of possible literal combination for FO hyper-res
 * @param {FOClause} c1 - Main hyper-res clause
 * @param {FOClause} c2 - Possible side premiss
 * @returns {Array<[number, number]>} - List of lit combinations
 */
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

/**
 * Adds a side premiss to the hyper-res move
 * @param {HyperResolutionMove} hyperRes - The Hyper Res move
 * @param {number} mainLitId - Id of the literal in the main clause
 * @param {number} clauseId - Id of the new side premiss clause
 * @param {number} litId - Id of the lit in the side premiss
 * @returns {HyperResolutionMove} - Resulting move
 */
export const addHyperSidePremiss = (
    hyperRes: HyperResolutionMove,
    mainLitId: number,
    clauseId: number,
    litId: number,
): HyperResolutionMove => ({
    ...hyperRes,
    atomMap: {
        ...hyperRes.atomMap,
        [mainLitId]: { first: clauseId, second: litId },
    },
});

/**
 * Removes a side premiss from the hyper-res move
 * @param {HyperResolutionMove} hyperRes - The Hyper Res move
 * @param {number} mainLitId - Id of the literal in the main clause to remove
 * @returns {HyperResolutionMove} - Resulting move
 */
export const removeHyperSidePremiss = (
    hyperRes: HyperResolutionMove,
    mainLitId: number,
): HyperResolutionMove => {
    delete hyperRes.atomMap[mainLitId];
    return {
        ...hyperRes,
        atomMap: {
            ...hyperRes.atomMap,
        },
    };
};

/**
 * Finds the id of the main lit for which a side premiss with the clause of id `ìd` exists in `hyperRes`
 * @param {HyperResolutionMove} hyperRes - The Hyper Res move
 * @param {number} id - The number of the side premiss
 * @returns {number} - The id of the main lit (-1 if not found)
 */
export const findHyperSidePremiss = (
    hyperRes: HyperResolutionMove,
    id: number,
): number => {
    for (const mId in hyperRes.atomMap) {
        if (
            hyperRes.atomMap.hasOwnProperty(mId) &&
            hyperRes.atomMap[mId].first === id
        ) {
            return parseInt(mId);
        }
    }
    return -1;
};

/**
 * Gets the ids of clauses that are side premisses
 * @param {HyperResolutionMove} hyperRes - The Hyper Res move
 * @returns {number[]} - The ids of the side premisses
 */
export const getHyperClauseIds = (hyperRes: HyperResolutionMove): number[] => {
    const ids: number[] = [];

    for (const mId in hyperRes.atomMap) {
        if (hyperRes.atomMap.hasOwnProperty(mId) && mId !== undefined) {
            ids.push(hyperRes.atomMap[mId].first);
        }
    }

    return ids;
};

/**
 * Finds the id of the optimal lit in main
 * @param {HyperResolutionMove} hyperRes - The Hyper Res move
 * @param {Clause} main - Main clause
 * @param {string} lit - The literal for resolution
 * @returns {number} - The id of the optimal main lit
 */
export const findOptimalMainLit = (
    hyperRes: HyperResolutionMove,
    main: Clause,
    lit: string,
) => {
    const candidates = main.atoms
        .map((a, i): [Atom, number] => [a, i])
        .filter(([a]) => a.negated && a.lit === lit)
        .map(([_, i]) => i);

    if (candidates.length === 1) {
        return candidates[0];
    }
    for (const c of candidates) {
        if (!(c in hyperRes.atomMap)) {
            return c;
        }
    }
    return candidates[0];
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
 * @param {VisualHelp} visualHelp - Whether to help user visually to find resolution partners
 * @param {ResolutionCalculusType} calculus - The current calculus type
 * @param {number} selectedClauseId - Currently selected clause
 * @returns {CandidateClause[]} - The new candidate clauses
 */
export const recalculateCandidateClauses = (
    clauseSet: ClauseSet<string | FOLiteral>,
    clauses: CandidateClause[],
    visualHelp: VisualHelp,
    calculus: ResolutionCalculusType,
    selectedClauseId?: number,
) => {
    const newCandidateClauses: CandidateClause[] = [];
    if (selectedClauseId === undefined) {
        // Create default candidates
        if (instanceOfPropClauseSet(clauseSet, calculus)) {
            clauses.forEach((clause, clauseIndex) => {
                newCandidateClauses[clauseIndex] = {
                    clause: clause.clause as Clause<string>,
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

        if (visualHelp === VisualHelp.rearrange) {
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
 * @param {ClauseSet<string | FOLiteral>} cs - The clause set to work on
 * @returns {boolean} - Whether the clause set contains the empty clause
 */
export const containsEmptyClause = (cs: ClauseSet<string | FOLiteral>) => {
    return cs.clauses.filter((c) => c.atoms.length === 0).length > 0;
};

/**
 * Send a resolve move (propositional) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {string} literal - The literal to resolve
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolve = (
    c1: number,
    c2: number,
    literal: string,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<PropResolutionState>,
) =>
    sendMove(
        server,
        Calculus.propResolution,
        state,
        { type: "res-resolve", c1, c2, literal },
        onChange,
        onError,
        onWarning,
    );

/**
 * Send a resolve unify move (FO logic) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {number} l1 - The id of the first atom
 * @param {number} l2 - The id of the second atom
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolveUnify = (
    c1: number,
    c2: number,
    l1: number,
    l2: number,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<FOResolutionState>,
) =>
    sendMove(
        server,
        Calculus.foResolution,
        state,
        { type: "res-resolveunify", c1, c2, l1, l2 },
        onChange,
        onError,
        onWarning,
    );

/**
 * Send a resolve move with variable assignments (FO logic) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {number} l1 - The id of the first atom
 * @param {number} l2 - The id of the second atom
 * @param {VarAssign} varAssign - The variable assignments
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolveCustom = (
    c1: number,
    c2: number,
    l1: number,
    l2: number,
    varAssign: VarAssign,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<FOResolutionState>,
) =>
    sendMove(
        server,
        Calculus.foResolution,
        state,
        { type: "res-resolvecustom", c1, c2, l1, l2, varAssign },
        onChange,
        onError,
        onWarning,
    );

/**
 * The function to call when the user hides a clause
 * @param {number} clauseId - The id of the clause to hide
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const hideClause = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    clauseId: number,
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<AppState[C]>,
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
        onWarning,
    );
};

/**
 * The function to call when the user wants to re-show hidden clauses
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const showHiddenClauses = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<AppState[C]>,
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
        onWarning,
    );
};

/**
 * The function to call when the user wants to factorize a clause
 * @param {number} selectedClauseId - The id of the selected clause
 * @param {Set<number>} atoms - The atom indices
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendFactorize = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    selectedClauseId: number,
    atoms: Set<number>,
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        onError,
        onWarning,
    }: APIInformation<AppState[C]>,
) => {
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-factorize",
            c1: selectedClauseId,
            atoms: Array.from(atoms),
        },
        onChange,
        onError,
        onWarning,
    );
};
