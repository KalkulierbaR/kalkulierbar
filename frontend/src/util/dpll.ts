import { AppStateUpdater } from "../types/app";
import { Atom, Clause, ClauseSet } from "../types/clause";
import {
    DPLLCsDiff,
    DPLLNodeType,
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
    setNode: (node: number) => void,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
) =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prop", branch, baseClause, propClause, propAtom },
        onChange,
        onError,
        onWarning,
    ).then((s) => {
        if (s) {
            setNode(s.tree.length - 1);
        }
        return s;
    });

export const sendPrune = (
    server: string,
    state: DPLLState,
    branch: number,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
) =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prune", branch },
        onChange,
        onError,
        onWarning,
    );

export const sendSplit = (
    server: string,
    state: DPLLState,
    branch: number,
    literal: string,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
) =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-split", branch, literal },
        onChange,
        onError,
        onWarning,
    );

export const sendModelCheck = (
    server: string,
    state: DPLLState,
    branch: number,
    interpretation: Record<string, boolean>,
    onChange: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
) =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-modelcheck", branch, interpretation },
        onChange,
        onError,
        onWarning,
    );

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

export const propCompatible = (a1: Atom) => (a2: Atom) =>
    a1.lit === a2.lit && a1.negated !== a2.negated;

export const getPropCandidates = (
    baseClause: Clause,
    propClause: Clause,
): number[] => {
    // If we have an incompatible clause, let the server handle it
    if (baseClause.atoms.length > 1 || baseClause.atoms.length === 0) {
        return propClause.atoms.map((_, i) => i);
    }
    const baseAtom = baseClause.atoms[0];

    const candidates: number[] = [];

    for (let i = 0; i < propClause.atoms.length; i++) {
        const a = propClause.atoms[i];
        if (propCompatible(baseAtom)(a)) {
            candidates.push(i);
        }
    }

    return candidates;
};

export const stateIsClosed = (nodes: DPLLTreeNode[]) =>
    nodes.reduce(
        (p, n) =>
            p && (n.children.length > 0 || n.type === DPLLNodeType.CLOSED),
        true,
    );
