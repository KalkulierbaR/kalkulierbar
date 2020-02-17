import { ClauseSet, FOClauseSet } from "./clause";
import { CnfStrategy, VarAssign } from "./tableaux";

export interface PropResolutionState {
    seal: string;
    clauseSet: ClauseSet;
    hiddenClauses: ClauseSet;
    highlightSelectable: boolean;
    newestNode: number;
}

export function instanceOfPropResolutionState(
    object: any
): object is PropResolutionState {
    return "clauseSet" in object;
}

export interface ResolutionResolveMove {
    type: "res-resolve";
    c1: number;
    c2: number;
    literal: string | null;
}

export interface ResolutionResolveUnifyMove {
    type: "res-resolveunify";
    c1: number;
    c2: number;
    l1: number;
    l2: number;
}

export interface ResolutionInstantiateMove {
    type: "res-instantiate";
    c1: number;
    varAssign: VarAssign;
}

export interface ResolutionHideMove {
    type: "res-hide";
    c1: number;
}

export interface ResolutionShowMove {
    type: "res-show";
}

export interface ResolutionFactoriseMove {
    type: "res-factorize";
    c1: number;
    a1: number;
    a2: number;
}

export type PropResolutionMove =
    | ResolutionResolveMove
    | ResolutionHideMove
    | ResolutionShowMove
    | ResolutionFactoriseMove;

export type FOResolutionMove =
    | PropResolutionMove
    | ResolutionResolveUnifyMove
    | ResolutionInstantiateMove
    | ResolutionFactoriseMove;

export interface PropResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}

export interface FOResolutionState {
    seal: string;
    clauseSet: FOClauseSet;
    highlightSelectable: boolean;
    hiddenClauses: FOClauseSet;
    newestNode: number;
}

export function instanceOfFOResolutionState(
    object: any
): object is FOResolutionState {
    return "clauseSet" in object;
}

export interface FOResolutionParams {
    highlightSelectable: boolean;
}
