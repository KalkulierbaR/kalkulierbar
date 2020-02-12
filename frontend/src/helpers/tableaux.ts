import {AppStateUpdater, Calculus, TableauxCalculusType} from "../types/app";
import {
    FOTableauxState,
    instanceOfFOTableauxState,
    instanceOfPropTableauxState,
    PropTableauxState,
    TableauxNode,
    VarAssign
} from "../types/tableaux";
import { sendMove } from "./api";

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
    autoClose?: boolean
) => {
    if (calculus === Calculus.propTableaux && instanceOfPropTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "CLOSE", id1: leaf, id2: pred },
            stateChanger,
            onError
        );
    } else if (calculus === Calculus.foTableaux && instanceOfFOTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            {
                type: autoClose ? "AUTOCLOSE" : "CLOSE",
                id1: leaf,
                id2: pred,
                varAssign: varAssignments!
            },
            stateChanger,
            onError
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
    onError: (msg: string) => void
) => {
    if (calculus === Calculus.propTableaux && instanceOfPropTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1 },
            stateChanger,
            onError
        );
    } else if (calculus === Calculus.foTableaux && instanceOfFOTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            { type: "UNDO", id1: -1, id2: -1, varAssign: {} },
            stateChanger,
            onError
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
    clause: number
) => {
    if (calculus === Calculus.propTableaux && instanceOfPropTableauxState(state)) {

        sendMove(
            server,
            calculus,
            state,
            { type: "EXPAND", id1: leaf, id2: clause },
            stateChanger,
            onError
        );
    } else if (calculus === Calculus.foTableaux && instanceOfFOTableauxState(state)) {

        sendMove(
            server,
            calculus,
            state,
            { type: "EXPAND", id1: leaf, id2: clause, varAssign: {} },
            stateChanger,
            onError
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
    lemma: number
) => {
    if (calculus === Calculus.propTableaux && instanceOfPropTableauxState(state)) {

        sendMove(
            server,
            calculus,
            state,
            { type: "LEMMA", id1: leaf, id2: lemma },
            stateChanger,
            onError
        );
    } else if (calculus === Calculus.foTableaux && instanceOfFOTableauxState(state)) {

        sendMove(
            server,
            calculus,
            state,
            { type: "LEMMA", id1: leaf, id2: lemma, varAssign: {} },
            stateChanger,
            onError
        );
    }
};
