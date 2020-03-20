import { StateUpdater } from "preact/hooks/src";
import { AppStateUpdater, TableauxCalculusType } from "../types/app";
import { LayoutItem } from "../types/layout";
import {
    FOTableauxState,
    instanceOfFOTabState,
    instanceOfPropTabState,
    PropTableauxState,
    TableauxNode,
    TableauxTreeLayoutNode,
    VarAssign,
    TableauxExpandMove,
    ClosableNodePair,
} from "../types/tableaux";
import { Tree, TreeLayout } from "../types/tree";
import { DragTransform } from "../types/ui";
import { sendMove } from "./api";
import { filterTree, tree, treeFind, treeLayout } from "./layout/tree";
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
 * @param {Function} onWarning - Warning handler
 * @param {number} leaf - The selected leaf
 * @param {number} pred - The selected predecessor
 * @param {boolean} autoClose - The server should decide about the variable assignment
 * @param {Map<string, string>} varAssignments - Variable assignments for manual unification
 * @param {CallableFunction} callback - The callback to perform after the move was send
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendClose = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
    leaf: number,
    pred: number,
    autoClose?: boolean,
    varAssignments?: VarAssign,
    callback?: CallableFunction,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "CLOSE", id1: leaf, id2: pred },
            stateChanger,
            onError,
            onWarning,
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
            onWarning,
        );
        if (callback !== undefined) {
            callback();
        }
    }
};

/**
 * Wrapper to send move request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {Function} onWarning - Warning handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendBacktrack = (
    calculus: TableauxCalculusType,
    server: string,
    state: PropTableauxState | FOTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
) => {
    if (instanceOfPropTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1 },
            stateChanger,
            onError,
            onWarning,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1, varAssign: {} },
            stateChanger,
            onError,
            onWarning,
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
 * @param {Function} onWarning - Warning handler
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
    onWarning: (msg: string) => void,
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
            onWarning,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "EXPAND", id1: leaf, id2: clause, varAssign: {} },
            stateChanger,
            onError,
            onWarning,
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
 * @param {Function} onWarning - Warning handler
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
    onWarning: (msg: string) => void,
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
            onWarning,
        );
    } else if (instanceOfFOTabState(state, calculus)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "LEMMA", id1: leaf, id2: lemma, varAssign: {} },
            stateChanger,
            onError,
            onWarning,
        );
    }
};

export const tableauxTreeLayout = (
    nodes: TableauxNode[],
): TreeLayout<TableauxTreeLayoutNode> => {
    return treeLayout(nodes, tabNodeToTree);
};

/**
 * Converts a list of TableauxNodes to a tree
 * @param {Array<TableauxNode>} nodes - The list of nodes
 * @param {TableauxNode} n - The current node
 * @param {number} i - Current index
 * @param {number} y - Current y position
 * @returns {Tree<TableauxTreeLayoutNode>} - The resulting tree
 */
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

/**
 * Finds a specific node in the tree
 * @param {Tree<TableauxTreeLayoutNode>} t - The tree to search
 * @param {number} id - The is to find
 * @returns {TableauxTreeLayoutNode} - The node
 */
export const getNode = (t: Tree<TableauxTreeLayoutNode>, id: number) =>
    treeFind(t, (s) => s.data.id === id)!;

/**
 * Gets all closed leaves
 * @param {Tree<TableauxTreeLayoutNode>} t - The tree
 * @returns {Array<LayoutItem<TableauxTreeLayoutNode>>} - All closed leaves
 */
export const getClosedLeaves = (
    t: Tree<TableauxTreeLayoutNode>,
): Array<LayoutItem<TableauxTreeLayoutNode>> =>
    filterTree(t, (c) => c.data.closeRef !== null).map((c) => ({
        x: c.x,
        y: c.y,
        data: c.data,
    }));

/**
 * Gives a function that sets a specific drag
 * @param {StateUpdater<Record<number, DragTransform>>} setDragTransform - The update function
 * @returns {Function} - Drag handler
 */
export const updateDragTransform = (
    setDragTransform: StateUpdater<Record<number, DragTransform>>,
) => (id: number, dt: DragTransform) => {
    setDragTransform((prev) => ({
        ...prev,
        [id]: dt,
    }));
};

/**
 * Computes the absolute dt of a node
 * @param {Tree<TableauxTreeLayoutNode>} t - Tree
 * @param {number} id - The id to look for
 * @param {Record<number, DragTransform>} dts - All dts
 * @param {DragTransform} dt - Current dt
 * @returns {DragTransform} - Absolute dt
 */
export const getAbsoluteDragTransform = (
    t: Tree<TableauxTreeLayoutNode>,
    id: number,
    dts: Record<number, DragTransform>,
    dt: DragTransform = dts[t.data.id] ?? { x: 0, y: 0 },
): DragTransform | undefined => {
    if (t.data.id === id) {
        return dt;
    }

    for (const c of t.children) {
        const cdt = dts[c.data.id] ?? { x: 0, y: 0 };
        const res = getAbsoluteDragTransform(c, id, dts, {
            x: dt.x + cdt.x,
            y: dt.y + cdt.y,
        });
        if (res !== undefined) {
            return res;
        }
    }

    return;
};

export const findClosableNode = (
    state: PropTableauxState,
    leafId: number,
): ClosableNodePair | undefined => {
    const leaf = state.nodes[leafId];

    let predId = leaf.parent;

    while (predId) {
        const pred = state.nodes[predId];

        if (pred.spelling === leaf.spelling && pred.negated !== leaf.negated) {
            return { leafId, predId };
        }

        predId = pred.parent;
    }

    return undefined;
};
