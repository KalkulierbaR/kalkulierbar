import { ClauseSet } from "./clause";

export interface DPLLTreeNode {
    children: number[];
    isLeaf: boolean;
    isAnnotation: boolean;
    modelVerified?: boolean;
}

export interface DPLLState {
    clauseSet: ClauseSet;
    tree: DPLLTreeNode[];
}

export interface DPLLSplit {
    type: "dpll-split";
    branch: number;
    literal: string;
}

export interface DPLLProp {
    type: "dpll-prop";
    branch: number;
    baseClause: number;
    propClause: number;
    propAtom: number;
}

export interface DPLLPrune {
    type: "dpll-prune";
    branch: number;
}

export interface DPLLModelCheck {
    type: "dpll-modelcheck";
    branch: number;
    interpretation: Record<string, boolean>;
}

export type DPLLMove = DPLLSplit | DPLLProp | DPLLPrune | DPLLModelCheck;
