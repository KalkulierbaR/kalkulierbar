export interface Tree {
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
    tl?: Tree;
    /**
     * Right thread.
     */
    tr?: Tree;

    /**
     * Left extreme node.
     */
    extremeLeft?: Tree;
    /**
     * Left extreme node.
     */
    extremeRight?: Tree;

    /**
     * Sum of modifiers at the left extreme node
     */
    modsEl: number;
    /**
     * Sum of modifiers at the right extreme node
     */
    modsEr: number;

    children: Tree[];
}

export const tree = (
    width: number,
    height: number,
    y: number,
    children: Tree[]
): Tree => ({
    width,
    height,
    x: 0,
    y,
    prelim: 0,
    mod: 0,
    shift: 0,
    change: 0,
    modsEl: 0,
    modsEr: 0,
    children
});

export interface LeftSiblingList {
    lowY: number;
    idx: number;
    next?: LeftSiblingList;
}
