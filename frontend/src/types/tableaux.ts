import { ClauseSet } from "./clause";

export interface Tree {}

export interface TableauxState {
    clauseSet: ClauseSet;
    tree: Tree;
}
