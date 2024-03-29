import { VarAssign } from "./tableaux";

export interface NCTableauxState {
    formula: LogicNode;
    backtracking: boolean;
    tree: NCTableauxNode[];
    moveHistory: NCTableauxMove[];
    usedBacktracking: boolean;
    identifiers: string[];
    gammaSuffixCounter: number;
    skolemCounter: number;
    seal: string;
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

export type LogicNode =
    | LogicVar
    | LogicNot
    | LogicAnd
    | LogicOr
    | LogicImpl
    | LogicRelation
    | AllQuantifier
    | ExQuantifier;

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

export type FOTerm = QuantifiedVar | Constant | FOFunction;

export interface NCTableauxNode {
    parent: number | null;
    formula: LogicNode;
    isClosed: boolean;
    closeRef: number | null;
    children: number[];
    spelling: string;
}

export interface NCTabTreeNode extends NCTableauxNode {
    id: number;
}

export interface NCTabAlphaMove {
    type: "alpha";
    nodeID: number;
}

export interface NCTabBetaMove {
    type: "beta";
    nodeID: number;
}

export interface NCTabGammaMove {
    type: "gamma";
    nodeID: number;
}

export interface NCTabDeltaMove {
    type: "delta";
    nodeID: number;
}

export interface NCTabCloseMove {
    type: "close";
    nodeID: number;
    closeID: number;
    varAssign: VarAssign | null;
}

export interface NCTabUndoMove {
    type: "undo";
}

export type NCTableauxMove =
    | NCTabAlphaMove
    | NCTabBetaMove
    | NCTabGammaMove
    | NCTabDeltaMove
    | NCTabCloseMove
    | NCTabUndoMove;
