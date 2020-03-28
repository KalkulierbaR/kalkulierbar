import { AppStateUpdater, NotificationHandler } from "../types/app";
import { Atom, Clause, ClauseSet } from "../types/clause";
import {
    DPLLCsDiff,
    DPLLNodeType,
    DPLLState,
    DPLLTreeLayoutNode,
    DPLLTreeNode,
} from "../types/dpll";
import { Tree, TreeLayout } from "../types/tree";
import { sendMove } from "./api";
import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

/**
 * Creates a tree layout for the nodes
 * @param {DPLLTreeNode[]} nodes - The nodes for the tree
 * @returns {TreeLayout} - the tree layout
 */
export const dpllTreeLayout = (
    nodes: DPLLTreeNode[],
): TreeLayout<DPLLTreeLayoutNode> => {
    return treeLayout(nodes, dpllNodesToTree);
};

/**
 * Converts nodes to a tree
 * @param {DPLLTreeNode[]} nodes - The nodes for the tree
 * @param {DPLLTreeNode} n - the current node
 * @param {number} i - current index
 * @param {number} y - current y coordinate
 * @returns {Tree} - the tree
 */
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

/**
 * Sends a prop move
 * @param {string} server - the server
 * @param {DPLLState} state - the current state
 * @param {number} branch - the current branch
 * @param {number} baseClause - the base clause
 * @param {number} propClause - the clause to propagate with
 * @param {number} propAtom - the atom to propagate over
 * @param {number} setNode - function to set the active node
 * @param {AppStateUpdater} onChange - function to set the calculus state
 * @param {NotificationHandler} notificationHandler - the notification handler
 * @returns {Promise<DPLLState>} - the new state
 */
export const sendProp = (
    server: string,
    state: DPLLState,
    branch: number,
    baseClause: number,
    propClause: number,
    propAtom: number,
    setNode: (node: number) => void,
    onChange: AppStateUpdater,
    notificationHandler: NotificationHandler,
): Promise<DPLLState | undefined> =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prop", branch, baseClause, propClause, propAtom },
        onChange,
        notificationHandler,
    ).then((s) => {
        if (s) {
            setNode(s.tree.length - 1);
        }
        return s;
    });

/**
 * Sends a prune move
 * @param {string} server - the server
 * @param {DPLLState} state - the current state
 * @param {number} branch - the current branch
 * @param {AppStateUpdater} onChange - function to set the calculus state
 * @param {NotificationHandler} notificationHandler - the notification handler
 * @returns {Promise<DPLLState>} - the new state
 */
export const sendPrune = (
    server: string,
    state: DPLLState,
    branch: number,
    onChange: AppStateUpdater,
    notificationHandler: NotificationHandler,
): Promise<DPLLState | undefined> =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-prune", branch },
        onChange,
        notificationHandler,
    );

/**
 * Sends a split move
 * @param {string} server - the server
 * @param {DPLLState} state - the current state
 * @param {number} branch - the current branch
 * @param {string} literal - the literal to split over
 * @param {AppStateUpdater} onChange - function to set the calculus state
 * @param {NotificationHandler} notificationHandler - the notification handler
 * @returns {Promise<DPLLState>} - the new state
 */
export const sendSplit = (
    server: string,
    state: DPLLState,
    branch: number,
    literal: string,
    onChange: AppStateUpdater,
    notificationHandler: NotificationHandler,
): Promise<DPLLState | undefined> =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-split", branch, literal },
        onChange,
        notificationHandler,
    );

/**
 * Sends a model check move
 * @param {string} server - the server
 * @param {DPLLState} state - the current state
 * @param {number} branch - the current branch
 * @param {Record} interpretation - interpretation to check
 * @param {AppStateUpdater} onChange - function to set the calculus state
 * @param {NotificationHandler} notificationHandler - the notification handler
 * @returns {Promise<DPLLState>} - the new state
 */
export const sendModelCheck = (
    server: string,
    state: DPLLState,
    branch: number,
    interpretation: Record<string, boolean>,
    onChange: AppStateUpdater,
    notificationHandler: NotificationHandler,
): Promise<DPLLState | undefined> =>
    sendMove(
        server,
        "dpll",
        state,
        { type: "dpll-modelcheck", branch, interpretation },
        onChange,
        notificationHandler,
    );

/**
 * Gets all literals of the clause set
 * @param {ClauseSet} cs - The clause set
 * @returns {string[]} - all literals
 */
export const getAllLits = (cs: ClauseSet): string[] => {
    const lits = new Set<string>();

    for (const c of cs.clauses) {
        for (const l of c.atoms) {
            lits.add(l.lit);
        }
    }

    return [...lits];
};

/**
 * Applies a clause set diff to a clause set
 * @param {ClauseSet} cs - the clause set
 * @param {DPLLCsDiff} diff - the cs diff
 * @returns {ClauseSet} - new clause set
 */
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

/**
 * Calculates the clause set for a branch
 * @param {DPLLState} state - the current state
 * @param {number} branch - the current branch
 * @returns {ClauseSet} - the clause for `branch`
 */
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

/**
 * Whether two atoms are compatible for propagation
 * @param {Atom} a1 - the first atom
 * @returns {Function} - checks the second atom
 */
export const propCompatible = (a1: Atom) => (a2: Atom) =>
    a1.lit === a2.lit && a1.negated !== a2.negated;

/**
 * Gets all candidate atoms for propagation
 * @param {Clause} baseClause - the base clause
 * @param {Clause} propClause - the candidate clause
 * @returns {number[]} - indices of all candidate atoms
 */
export const getPropCandidates = (
    baseClause: Clause,
    propClause: Clause,
): number[] => {
    // If we have an incompatible clause, let the server handle it
    if (baseClause.atoms.length > 1 || baseClause.atoms.length === 0) {
        return propClause.atoms.map((_, i) => i);
    }
    const baseAtom = baseClause.atoms[0];
    const checkCompatible = propCompatible(baseAtom);

    const candidates: number[] = [];

    for (let i = 0; i < propClause.atoms.length; i++) {
        const a = propClause.atoms[i];

        if (checkCompatible(a)) {
            candidates.push(i);
        }
    }

    return candidates;
};

/**
 * Checks whether the state is closed
 * @param {DPLLTreeNode[]} nodes - nodes of the state
 * @returns {boolean} - Whether the state is closed
 */
export const stateIsClosed = (nodes: DPLLTreeNode[]): boolean =>
    nodes.reduce(
        (p: boolean, n) =>
            p && (n.children.length > 0 || n.type === DPLLNodeType.CLOSED),
        true,
    );
