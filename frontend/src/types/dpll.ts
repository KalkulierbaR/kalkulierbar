import { Clause, ClauseSet } from "./clause";

export interface DPLLTreeNode {
    parent: number | null;
    type: DPLLNodeType;
    label: string;
    children: number[];
    modelVerified: boolean | null;
    diff: DPLLCsDiff;
}

export interface DPLLCsDiffIdentity {
    type: "cd-identity";
}

export interface DPLLCsDiffRemoveClause {
    type: "cd-delclause";
    id: number;
}

export interface DPLLCsDiffAddClause {
    type: "cd-addclause";
    clause: Clause;
}

export interface DPLLCsDiffRemoveAtom {
    type: "cd-delatom";
    cid: number;
    aid: number;
}

export type DPLLCsDiff =
    | DPLLCsDiffIdentity
    | DPLLCsDiffRemoveClause
    | DPLLCsDiffAddClause
    | DPLLCsDiffRemoveAtom;

export type DPLLTreeLayoutNode = DPLLTreeNode & { id: number };

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
    seal: string;
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
