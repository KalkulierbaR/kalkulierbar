import { ClauseSet } from "./clause";

export interface DPLLTreeNode {
    parent: number | null;
    type: DPLLNodeType;
    label: string;
    children: number[];
    isLeaf: boolean;
    isAnnotation: boolean;
    modelVerified?: boolean;
}

export enum DPLLNodeType {
    ROOT = "ROOT",
    PROP = "PROP",
    SPLIT = "SPLIT",
    MODEL = "MODEL",
    CLOSED = "CLOSED",
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
