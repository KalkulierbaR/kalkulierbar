import { AppStateUpdater, TableauxCalculusType } from "../types/app";
import { Layout } from "../types/layout";
import {
    FOTableauxState,
    instanceOfFOTabState,
    instanceOfPropTabState,
    PropTableauxState,
    TableauxNode,
    TableauxTreeLayoutNode,
    VarAssign,
} from "../types/tableaux";
import { Link, Tree } from "../types/tree";
import { sendMove } from "./api";
import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

/**
 * Finds the first open leaf and returns its id.
 * @param {Array<TableauxNode>} nodes - the nodes to search through.
 * @returns {number|undefined} id of the next open leaf if any.
 */
export const nextOpenLeaf = (nodes: TableauxNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isClosed && n.children.length === 0) {
            return i;
        }
    }
    return;
};

/**
 * Wrapper to send close request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} pred - The selected predecessor
 * @param {Map<string, string>} varAssignments - Variable assignments for manual unification
 * @param {boolean} autoClose - The server should decide about the variable assignment
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendClose = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    pred: number,
    varAssignments?: VarAssign,
    autoClose?: boolean,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "CLOSE", id1: leaf, id2: pred },
            stateChanger,
            onError,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            {
                type: autoClose ? "AUTOCLOSE" : "CLOSE",
                id1: leaf,
                id2: pred,
                varAssign: varAssignments!,
            },
            stateChanger,
            onError,
        );
    }
};

/**
 * Wrapper to send move request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendBacktrack = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1 },
            stateChanger,
            onError,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1, varAssign: {} },
            stateChanger,
            onError,
        );
    }
};

/**
 * Wrapper to send move request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} clause - The selected clause
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendExtend = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    clause: number,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "EXPAND", id1: leaf, id2: clause },
            stateChanger,
            onError,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "EXPAND", id1: leaf, id2: clause, varAssign: {} },
            stateChanger,
            onError,
        );
    }
};

/**
 * Wrapper to send move request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} lemma - The selected Node to be used as lemma
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendLemma = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    lemma: number,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "LEMMA", id1: leaf, id2: lemma },
            stateChanger,
            onError,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "LEMMA", id1: leaf, id2: lemma, varAssign: {} },
            stateChanger,
            onError,
        );
    }
};

export const tableauxTreeLayout = (
    nodes: TableauxNode[],
): Layout<TableauxTreeLayoutNode> & { links: Link[] } => {
    return treeLayout(nodes, tabNodeToTree);
};

const tabNodeToTree = (
    nodes: TableauxNode[],
    n: TableauxNode = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<TableauxTreeLayoutNode> => {
    const width =
        estimateSVGTextWidth(`${n.negated ? "¬" : ""}${n.spelling}`) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => tabNodeToTree(nodes, nodes[c], c, y + 72)),
    );
};
