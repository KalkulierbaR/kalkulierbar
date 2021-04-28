import { StateUpdater } from "preact/hooks";

import { AppStateUpdater } from "../types/app/app-state";
import { NotificationHandler } from "../types/app/notification";
import { ModalCalculusType } from "../types/calculus";
import {
    ExpandMove,
    ModalTableauxNode,
    ModalTableauxState,
    ModalTableauxTreeLayoutNode,
} from "../types/calculus/modal-tableaux";
import { Tree, TreeLayout } from "../types/tree";
import { DragTransform } from "../types/ui";

import { sendMove } from "./api";
import { tree, treeFind, treeLayout } from "./layout/tree";
import { estimateSVGTextWidth } from "./text-width";

/**
 * Wrapper to send move request
 * @param {TableauxCalculusType} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {NotificationHandler} notificationHandler - The notification handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendBacktrack = (
    calculus: ModalCalculusType,
    server: string,
    state: ModalTableauxState,
    stateChanger: AppStateUpdater,
    notificationHandler: NotificationHandler,
) =>
    sendMove(
        server,
        calculus,
        state,
        { type: "undo" },
        stateChanger,
        notificationHandler,
    );

/**
 * Sends a NodeExtend Move to the backend
 * @param {ModalCalculusType} calculus the calculus tape
 * @param {string} server the backend server
 * @param {ModalTableauxState} state current state
 * @param {string} move the move to send
 * @param {AppStateUpdater} stateChanger StateChanger
 * @param {NotificationHandler} notificationHandler NotificationHandler
 * @param {ModalTableauxNode[]} nodes nodes in the current state
 * @param {number} nodeID the selected Node
 * @param {Function} setLeafSelected function
 * @param {Function} setSelectedMove function
 * @param {Function} setSelectedNodeId function
 * @returns {void} nothing
 */
export const sendNodeExtend = (
    calculus: ModalCalculusType,
    server: string,
    state: ModalTableauxState,
    move: string,
    stateChanger: AppStateUpdater,
    notificationHandler: NotificationHandler,
    nodes: ModalTableauxNode[],
    nodeID: number,
    setLeafSelected: (b: boolean) => void,
    setSelectedMove: (move: ExpandMove) => void,
    setSelectedNodeId: (id: number | undefined) => void,
) => {
    const node = nodes[nodeID];
    const leaves = getLeaves(nodes, node);
    if (leaves.length > 1) {
        // Ask for Leaf to apply the rule on
        setLeafSelected(true);
        setSelectedMove({ type: move, nodeID, leafID: leaves[0] });
        // sendMove(server, calculus, state, {type: move, nodeID: nodeID, leafID: leaves[leaves.length - 1]}, stateChanger, notificationHandler);
    } else {
        // No need to ask -> apply the rule on the only possible Leaf
        sendMove(
            server,
            calculus,
            state,
            { type: move, nodeID, leafID: leaves[0] },
            stateChanger,
            notificationHandler,
        );
        setSelectedNodeId(undefined);
    }
};

/**
 * recursevly gets the number of leaves
 * @param {ModalTableauxNode[]} nodes all nodes
 * @param {ModalTableauxNode} node current parent node
 * @returns {number[]} the sum of all leaves
 */
export const getLeaves = (
    nodes: ModalTableauxNode[],
    node: ModalTableauxNode,
) => {
    if (node.children.length === 0 && !node.isClosed) {
        return [nodes.findIndex((elem) => elem === node)];
    }

    let sum: number[] = [];
    node.children.forEach((childID) => {
        const child = nodes[childID];
        sum = sum.concat(getLeaves(nodes, child));
    });
    return sum;
};
/**
 * checks wether a node is a child
 * @param {ModalTableauxNode} node current node
 * @param {ModalTableauxNode} parent the parent node of the current node
 * @param {ModalTableauxNode[]} nodes all nodes
 * @returns {boolean} isChild
 */
export const isChildOf = (
    node: ModalTableauxNode,
    parent: ModalTableauxNode,
    nodes: ModalTableauxNode[],
): boolean => {
    if (node === parent) {
        return true;
    }
    if (node.parent !== null) {
        return isChildOf(nodes[node.parent!], parent, nodes);
    }

    return false;
};

/**
 * @param {ModalTableauxNode} node - The node
 * @returns {string} - The name
 */
export const nodeName = (node: ModalTableauxNode) => {
    if (node === undefined) return "";
    return `
        ${node.prefix.toString().replace(",", ".")}
        ${node.sign ? "𝕋 " : "𝔽 "}
        ${node.spelling}
    `;
};

/**
 * @param {ModalTableauxNode[]} nodes - The nodes to work on
 * @returns {TreeLayout<ModalTableauxTreeLayoutNode>} - The tree layout
 */
export const modalTableauxTreeLayout = (
    nodes: ModalTableauxNode[],
): TreeLayout<ModalTableauxTreeLayoutNode> => {
    return treeLayout(nodes, modalTabNodeToTree);
};

/**
 * Converts a list of TableauxNodes to a tree
 * @param {Array<ModalTableauxNode>} nodes - The list of nodes
 * @param {ModalTableauxNode} n - The current node
 * @param {number} i - Current index
 * @param {number} y - Current y position
 * @returns {Tree<ModalTableauxTreeLayoutNode>} - The resulting tree
 */
const modalTabNodeToTree = (
    nodes: ModalTableauxNode[],
    n: ModalTableauxNode = nodes[0],
    i: number = 0,
    y: number = 16,
): Tree<ModalTableauxTreeLayoutNode> => {
    const width = estimateSVGTextWidth(nodeName(n)) + 56;
    return tree(
        width,
        72,
        y,
        { ...n, id: i },
        n.children.map((c) => modalTabNodeToTree(nodes, nodes[c], c, y + 72)),
    );
};

/**
 * Finds a specific node in the tree
 * @param {Tree<ModalTableauxTreeLayoutNode>} t - The tree to search
 * @param {number} id - The id to find
 * @returns {ModalTableauxTreeLayoutNode} - The node
 */
export const getNode = (t: Tree<ModalTableauxTreeLayoutNode>, id: number) =>
    treeFind(t, (s) => s.data.id === id)!;

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
