import { RuleSet } from "./rules";
import { PropCalculusType, Calculus } from ".";

export interface PSCNode {
    parent: number | null;
    Children: number[] | null;
    leftClauses: string[];
    rightClause: string[];
}

export type PSCTreeLayoutNode = PSCNode & { id: number};

export interface PSCState {
    ruleSet: RuleSet;
    nodes: PSCNode[];
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