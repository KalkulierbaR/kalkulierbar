import { Point } from "./ui";

export interface Tree<T> {
    width: number;
    height: number;
    x: number;
    y: number;
    prelim: number;
    mod: number;
    shift: number;
    change: number;

    /**
     * Left thread.
     */
    tl?: Tree<T>;
    /**
     * Right thread.
     */
    tr?: Tree<T>;

    /**
     * Left extreme node.
     */
    extremeLeft?: Tree<T>;
    /**
     * Left extreme node.
     */
    extremeRight?: Tree<T>;

    /**
     * Sum of modifiers at the left extreme node
     */
    modsEl: number;
    /**
     * Sum of modifiers at the right extreme node
     */
    modsEr: number;

    children: Array<Tree<T>>;

    treeHeight: number;

    data: T;
}

export interface Link {
    source: Point;
    target: Point;
}

export interface LeftSiblingList {
    lowY: number;
    idx: number;
    next?: LeftSiblingList;
}
