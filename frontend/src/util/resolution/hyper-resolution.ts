import { Atom, Clause, FOClause } from "../../types/calculus/clause";
import { HyperResolutionMove } from "../../types/calculus/resolution";

/**
 * Gets a list of possible literal combination for prop. hyper-res
 * @param {Clause} c1 - Main hyper-res clause
 * @param {Clause} c2 - Possible side premiss
 * @returns {Array<[number, number]>} - List of lit combinations
 */
export const getPropHyperCandidates = (
    c1: Clause,
    c2: Clause,
): [number, number][] => {
    const lits: [number, number][] = [];
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
): [number, number][] => {
    const lits: [number, number][] = [];
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
        .map(([, i]) => i);

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
