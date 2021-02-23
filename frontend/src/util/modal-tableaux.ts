import {ExpandMove, ModalTableauxMove, ModalTableauxNode, ModalTableauxState, ModalTableauxTreeLayoutNode} from "../types/calculus/modal-tableaux";
import { tree, treeFind, treeLayout } from "./layout/tree";
import { Tree, TreeLayout } from "../types/tree";
import { DragTransform } from "../types/ui";
import { estimateSVGTextWidth } from "./text-width";
import { StateUpdater } from "preact/hooks";
import { ModalCalculusType } from "../types/calculus";
import { AppStateUpdater } from "../types/app/app-state";
import { NotificationHandler } from "../types/app/notification";
import { sendMove } from "./api";
import { child } from "../components/tutorial/dialog/style.scss";

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
 * Finds the first open leaf and returns its id.
 * @param {Array<TableauxNode>} nodes - the nodes to search through.
 * @returns {number|undefined} id of the next open leaf if any.
 */
export const nextOpenLeaf = (nodes: ModalTableauxNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isClosed && n.children.length === 0) {
            return i;
        }
    }
    return;
};

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
    let node = nodes[nodeID]
    let leaves = getLeaves(nodes, node);
    if (leaves.length > 1) {
        //Ask for Leaf to apply the rule on
        setLeafSelected(true);
        setSelectedMove({type: move, nodeID: nodeID, leafID: leaves[0]})
        // sendMove(server, calculus, state, {type: move, nodeID: nodeID, leafID: leaves[leaves.length - 1]}, stateChanger, notificationHandler);
    } else {
        //No need to ask -> apply the rule on the only possible Leaf
        sendMove(server, calculus, state, {type: move, nodeID: nodeID, leafID: leaves[0]}, stateChanger, notificationHandler);
        setSelectedNodeId(undefined);
    }
}

export const getLeaves = (nodes: ModalTableauxNode[], node: ModalTableauxNode) => {
    if (node.children.length === 0 && !node.isClosed) {
        return [nodes.findIndex(elem => elem === node)];
    }
        
    let sum: number[] = [];
    node.children.forEach(childID => {
        let child = nodes[childID];
        sum = sum.concat(getLeaves(nodes, child));
    })
    return sum;
}

export const isChildOf = (node: ModalTableauxNode, parent: ModalTableauxNode, nodes: ModalTableauxNode[]) => {
    if (node === parent){
        return true;
    }else if (node.parent !== null) {
        let a = isChildOf(nodes[node.parent!], parent, nodes); 
        if (a === true)
            return true;
        else 
            return false;
        
    }
    
    return false;
    
}

/**
 * @param {ModalTableauxNode} node - The node
 * @returns {string} - The name
 */
export const nodeName = (node: ModalTableauxNode) => {
    if(node === undefined) return "";
    return `
        ${node.sign ? "T " : "F " }
        ${node.prefix.map(
            (prefix, index) => prefix.toString() + (index === node.prefix.length - 1 ? "" : ".")
        )}
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