export interface ModalTableauxNode {
    parent: number | null;
    prefix: number[];
    sign: boolean;
    formula: LogicNode;
    isClosed: boolean;
    spelling: string;
    closeRef: number | null;
    children: number[];
    lemmaSource?: number;
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

export interface LogicVar {
    type: "var";
    spelling: string;
}

export interface LogicNot {
    type: "not";
    child: LogicNode;
}

export interface BinaryLogicNode {
    type: string;
    leftChild: LogicNode;
    rightChild: LogicNode;
}

export interface LogicAnd extends BinaryLogicNode {
    type: "and";
}

export interface LogicOr extends BinaryLogicNode {
    type: "or";
}

export interface LogicImpl extends BinaryLogicNode {
    type: "impl";
}

export interface LogicRelation {
    type: "relation";
    spelling: string;
    arguments: FOTerm[];
}

export interface BoundVar {
    spelling: string;
}

export interface Quantifier {
    varName: string;
    child: LogicNode;
    boundVariables: BoundVar[];
}

export interface AllQuantifier extends Quantifier {
    type: "allquant";
}

export interface ExQuantifier extends Quantifier {
    type: "exquant";
}

export interface QuantifiedVar {
    type: "QuantifiedVariable";
    spelling: string;
}

export interface Constant {
    type: "Constant";
    spelling: string;
}

export interface FOFunction {
    type: "Function";
    spelling: string;
    arguments: FOTerm[];
}

export interface Box {
    type: "box";
    child: LogicNode;
}

export interface Diamond {
    type: "diamond";
    child: LogicNode;
}

export type FOTerm = QuantifiedVar | Constant | FOFunction;

export type LogicNode =
    | LogicVar
    | LogicNot
    | LogicAnd
    | LogicOr
    | LogicImpl
    | LogicRelation
    | AllQuantifier
    | ExQuantifier
    | Box
    | Diamond;

export type ModalTableauxTreeLayoutNode = ModalTableauxNode & { id: number };

export type ModalTableauxMove =
    | ExpandMove
    | UndoMove
    | CloseMove
    | NegMove;

export interface ExpandMove {
    type?: string;
    nodeID?: number;
    leafID?: number;
    prefix?: number;
}

export interface AlphaMove extends ExpandMove {
    type: "alphaMove";
    nodeID: number;
    leafID: number;
}

export interface BetaMove extends ExpandMove {
    type: "betaMove";
    nodeID: number;
    leafID: number;
}

export interface NuMove extends ExpandMove {
    type: "nuMove";
    prefix: number;
    nodeID: number;
    leafID: number;
}

export interface PiMove extends ExpandMove {
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

export interface NegMove {
    type: "negation";
    nodeID: number;
    leafID: number;
}

export interface UndoMove {
    type: "undo";
}

export interface ModalTableauxParams {
    backtracking: boolean;
}
