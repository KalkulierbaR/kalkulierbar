import { RuleSet } from "./rules";
import { PropCalculusType, Calculus } from ".";

export interface PSCNode {
    type: string;
    parent: number | null;
    children: number[];
    leftFormulas: FormulaNode[];
    rightFormulas: FormulaNode[];
}

export interface FormulaNode {
    type: string;
    leftChild: FormulaNode | null;
    rightChild: FormulaNode | null;
    spelling: string | null;
}

export type PSCTreeLayoutNode = PSCNode & { id: number};

export interface PSCState {
    tree: PSCNode[];
}

export function instanceOfPSCState(
    object: any,
    calculus: PropCalculusType,
): object is PSCState {
    return "ruleSet" in object && calculus === Calculus.psc;
}

export interface PSCMove {
    type: "standard"
}