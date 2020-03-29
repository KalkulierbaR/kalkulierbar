import { ClauseSet, FOLiteral } from "../../types/calculus/clause";

/**
 * @param {ClauseSet<string | FOLiteral>} cs - The clause set to work on
 * @returns {boolean} - Whether the clause set contains the empty clause
 */
export const containsEmptyClause = (cs: ClauseSet<string | FOLiteral>) => {
    return cs.clauses.filter((c) => c.atoms.length === 0).length > 0;
};

export {
    sendFactorize,
    sendResolve,
    sendResolveCustom,
    sendResolveUnify,
    hideClause,
    showHiddenClauses,
} from "./api";

export {
    getPropHyperCandidates,
    getFOHyperCandidates,
    getHyperClauseIds,
    addHyperSidePremiss,
    removeHyperSidePremiss,
    findHyperSidePremiss,
    findOptimalMainLit,
} from "./hyper-resolution";

export {
    groupCandidates,
    getSelectable,
    getInitialCandidateClauses,
    recalculateCandidateClauses,
    addClause,
} from "./candidate-clauses";
