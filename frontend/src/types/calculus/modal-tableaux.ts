import { LogicNode } from "./nc-tableaux";

export interface ModalTableauxNode {
    parent: number | null;
    prefix: number[];    
    sign: boolean;
    formula: LogicNode;
    isClosed: boolean;
    spelling: string;
    closeRef: number | null;
    children: number[];
    lemmaSource? : number;
}

export interface ModalTableauxState {
    nodes: ModalTableauxNode[];
    assumption: boolean;
    seal: string;
    backtracking: boolean;
    usedBacktracking: boolean;
    moveHistory: ModalTableauxMove[];
    usedPrefixes: number[][];
    statusMessage: string | null;
}

export type ModalTableauxTreeLayoutNode = ModalTableauxNode & { id: number };

export type ModalTableauxMove = 
    AlphaMove | BetaMove | NuMove | PiMove | UndoMove | CloseMove;

export interface AlphaMove {
    type: "alphaMove";
    nodeID: number;
    leafID: number;
}

export interface BetaMove {
    type: "betaMove";
    nodeID: number;
    leafID: number;
}

export interface NuMove {
    type: "nuMove";
    prefix: number;
    nodeID: number;
    leafID: number;
}

export interface PiMove {
    type: "piMove";
    prefix: number;
    nodeID: number;
    leafID: number;
}

export interface CloseMove {
    type: "close";
    nodeID: number;
    leafID: number;
}

export interface UndoMove {
    type: "undo";
}