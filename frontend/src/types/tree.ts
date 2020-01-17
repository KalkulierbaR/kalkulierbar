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

    data: T;
}

export const tree = <T>(
    width: number,
    height: number,
    y: number,
    data: T,
    children: Array<Tree<T>>
): Tree<T> => ({
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
    data,
    children
});

export interface LeftSiblingList {
    lowY: number;
    idx: number;
    next?: LeftSiblingList;
}
