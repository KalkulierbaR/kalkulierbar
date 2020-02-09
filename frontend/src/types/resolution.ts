import { ClauseSet, FOClauseSet } from "./clause";
import { CnfStrategy, VarAssign } from "./tableaux";

export interface PropResolutionState {
    seal: string;
    clauseSet: ClauseSet;
    highlightSelectable: boolean;
    newestNode: number;
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

export type PropResolutionMove =
    | ResolutionResolveMove
    | ResolutionHideMove
    | ResolutionShowMove;

export type FOResolutionMove =
    | PropResolutionMove
    | ResolutionResolveUnifyMove
    | ResolutionInstantiateMove;

export interface PropResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}

export interface FOResolutionState {
    seal: string;
    clauseSet: FOClauseSet;
    highlightSelectable: boolean;
    newestNode: number;
}

export interface FOResolutionParams {
    cnfStrategy: CnfStrategy;
    highlightSelectable: boolean;
}
