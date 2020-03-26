import { AppStateUpdater } from "../types/app";
import {
    FOTerm,
    LogicNode,
    LogicRelation,
    NCTableauxNode,
    NCTableauxState,
    NCTabTreeNode,
} from "../types/nc-tableaux";
import { VarAssign } from "../types/tableaux";
import { Tree } from "../types/tree";
import { sendMove } from "./api";
import { tree, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

/**
 * Send alpha move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {number} nodeID - The node's id
 * @returns {void}
 */
export const sendAlpha = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    nodeID: number,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "alpha", nodeID },
        stateChanger,
        onError,
    );

/**
 * Send beta move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {number} nodeID - The node's id
 * @returns {void}
 */
export const sendBeta = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    nodeID: number,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "beta", nodeID },
        stateChanger,
        onError,
    );

/**
 * Send gamma move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {number} nodeID - The node's id
 * @returns {void}
 */
export const sendGamma = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    nodeID: number,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "gamma", nodeID },
        stateChanger,
        onError,
    );

/**
 * Send delta move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {number} nodeID - The node's id
 * @returns {void}
 */
export const sendDelta = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    nodeID: number,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "delta", nodeID },
        stateChanger,
        onError,
    );

/**
 * Send close move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {number} nodeID - The node's id
 * @param {number} closeID - The second node's id
 * @param {VarAssign | null} varAssign - The variable assignments
 * @returns {void}
 */
export const sendClose = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    nodeID: number,
    closeID: number,
    varAssign: VarAssign | null,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "close", nodeID, closeID, varAssign },
        stateChanger,
        onError,
    );

/**
 * Send undo move to backend
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} stateChanger - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @returns {void}
 */
export const sendUndo = (
    server: string,
    state: NCTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
) =>
    sendMove(
        server,
        "nc-tableaux",
        state,
        { type: "undo" },
        stateChanger,
        onError,
    );

/**
 * @param {NCTableauxNode[]} nodes - The nodes to work on
 * @returns {TreeLayout<T>} - The tree layout
 */
export const ncTabTreeLayout = (nodes: NCTableauxNode[]) =>
    treeLayout(nodes, ncTabNodeToTree);

/**
 * Get a tree from a ncTabNode
 * @param {NCTableauxNode[]} nodes - The nodes to work on
 * @param {NCTableauxNode} n - The tree's root
 * @param {number} i - The id
 * @param {number} y - The y coordinate
 * @returns {Tree<NCTabTreeNode>} - The tree
 */
const ncTabNodeToTree = (
    nodes: NCTableauxNode[],
    n: NCTableauxNode = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<NCTabTreeNode> => {
    const width = estimateSVGTextWidth(n.spelling) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => ncTabNodeToTree(nodes, nodes[c], c, y + 72)),
    );
};

/**
 * Collect vars from a term
 * @param {string[]} vars - The vars array to fill
 * @param {FOTerm} term - The term to search in
 * @returns {void}
 */
export const collectVarsFromTerm = (vars: string[], term: FOTerm) => {
    switch (term.type) {
        case "Constant":
            break;
        case "QuantifiedVariable":
            vars.push(term.spelling);
            break;
        case "Function":
            for (const arg of term.arguments) {
                collectVarsFromTerm(vars, arg);
            }
            break;
    }
};

/**
 * Collect vars from a node
 * @param {string[]} vars - The vars array to fill
 * @param {LogicNode} formula - The formula to search in
 * @returns {void}
 */
export const collectVarsFromNode = (vars: string[], formula: LogicNode) => {
    let node: LogicRelation;
    if (formula.type === "not" && formula.child.type === "relation") {
        node = formula.child;
    } else if (formula.type === "relation") {
        node = formula;
    } else {
        return;
    }

    for (const arg of node.arguments) {
        collectVarsFromTerm(vars, arg);
    }
    return vars;
};
