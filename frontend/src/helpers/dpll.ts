import { AppStateUpdater } from "../types/app";
import { ClauseSet } from "../types/clause";
import {
    DPLLCsDiff,
    DPLLState,
    DPLLTreeLayoutNode,
    DPLLTreeNode,
} from "../types/dpll";
import { Tree } from "../types/tree";
import { sendMove } from "./api";
import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

export const dpllTreeLayout = (nodes: DPLLTreeNode[]) => {
    return treeLayout(nodes, dpllNodesToTree);
};

const dpllNodesToTree = (
    nodes: DPLLTreeNode[],
    n = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<DPLLTreeLayoutNode> => {
    const width = estimateSVGTextWidth(n.label) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => dpllNodesToTree(nodes, nodes[c], c, y + 72)),
    );
};

export const sendProp = (
    server: string,
    state: DPLLState,
    branch: number,
    baseClause: number,
    propClause: number,
    propAtom: number,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
) => {
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prop", branch, baseClause, propClause, propAtom },
        onChange,
        onError,
    );
};

export const sendPrune = (
    server: string,
    state: DPLLState,
    branch: number,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
) => {
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prune", branch },
        onChange,
        onError,
    );
};

export const sendSplit = (
    server: string,
    state: DPLLState,
    branch: number,
    literal: string,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
) => {
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-split", branch, literal },
        onChange,
        onError,
    );
};

export const getAllLits = (cs: ClauseSet) => {
    const lits = new Set<string>();

    for (const c of cs.clauses) {
        for (const l of c.atoms) {
            lits.add(l.lit);
        }
    }

    return [...lits];
};

const applyCsDiff = (cs: ClauseSet, diff: DPLLCsDiff): ClauseSet => {
    switch (diff.type) {
        case "cd-identity":
            return cs;
        case "cd-addclause":
            return { clauses: [...cs.clauses, diff.clause] };
        case "cd-delclause":
            return { clauses: cs.clauses.filter((_, i) => i !== diff.id) };
        case "cd-delatom": {
            const clauses = [...cs.clauses];

            clauses[diff.cid] = {
                atoms: clauses[diff.cid].atoms.filter((_, i) => i !== diff.aid),
            };

            return { clauses };
        }
    }
};

export const calculateClauseSet = (
    state: DPLLState,
    branch: number,
): ClauseSet => {
    const node = state.tree[branch];
    if (node.parent === null) {
        return state.clauseSet;
    }
    return applyCsDiff(calculateClauseSet(state, node.parent), node.diff);
};
