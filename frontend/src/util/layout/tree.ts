import { LayoutItem } from "../../types/layout";
import { LeftSiblingList, Link, Tree, TreeLayout } from "../../types/tree";
import { DragTransform } from "../../types/ui";
import { maxBy } from "../max-by";

// Code taken and adjusted from the paper "Drawing Non-layered Tidy Trees in Linear Time".
// https://doi.org/10.1002/spe.2213

export const tree = <T>(
    width: number,
    height: number,
    y: number,
    data: T,
    children: Array<Tree<T>>,
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
    treeHeight: maxBy(children, (c) => c.treeHeight) + height,
    children,
});

export const treeLayout = <N, T extends { id: number }>(
    nodes: N[],
    nodesToTree: (nodes: N[]) => Tree<T>,
): TreeLayout<T> => {
    const root = nodesToTree(nodes);
    layout(root);

    if (root.x - root.width / 2 < 0) {
        const dist = -(root.x - root.width / 2);
        preOrderTraverseTree(root, (t) => {
            t.x += dist;
        });
    }

    const width = treeWidth(root);
    const links = getLinks(root);
    return { width, height: root.treeHeight, root, links };
};

export const preOrderTraverseTree = <T>(
    t: Tree<T>,
    f: (t: Tree<T>) => void,
) => {
    f(t);
    for (const c of t.children) {
        preOrderTraverseTree(c, f);
    }
};

/**
 * Finds a specific node in the tree
 * @param {Tree<T>} t - The tree to search in
 * @param {Predicate} p - The predicate to search by
 * @returns {T} - The data of the first node to fulfill `p`
 */
export const treeFind = <T>(t: Tree<T>, p: (t: Tree<T>) => boolean) =>
    findSubTree(t, p, (c) => c.data);

/**
 * Finds a specific subtree and then runs a conversion function on the result
 * @param {Tree<T>} t - The tree to search in
 * @param {Predicate} p - The predicate to search by
 * @param {Function} c - The conversion function
 * @returns {V} - The result of the conversion
 */
export const findSubTree = <T, V>(
    t: Tree<T>,
    p: (t: Tree<T>) => boolean,
    c: (t: Tree<T>) => V,
): V | undefined => {
    if (p(t)) {
        return c(t);
    }

    for (const child of t.children) {
        const res = findSubTree(child, p, c);
        if (res !== undefined) {
            return res;
        }
    }

    return;
};

/**
 * Filters the tree and returns the sub trees as any array
 * @param {Tree<T>} t - The tree to filter
 * @param {Predicate} p - The predicate to filter by
 * @returns {Array<Tree<T>>} - The result array
 */
export const filterTree = <T>(t: Tree<T>, p: (tree: Tree<T>) => boolean) => {
    const res: Array<Tree<T>> = [];

    preOrderTraverseTree(t, (c) => {
        if (p(c)) {
            res.push(c);
        }
    });

    return res;
};

export const treeToLayoutItem = <T extends { id: number }>(
    t: Tree<T>,
): Array<LayoutItem<T>> => {
    const items: Array<LayoutItem<T>> = [];

    preOrderTraverseTree(t, ({ x, y, data }) => {
        items[data.id] = { x, y, data };
    });

    return items;
};

/**
 * Computes the absolute dt of a node
 * @param {Tree<T>} t - Tree
 * @param {number} id - The id to look for
 * @param {Record<number, DragTransform>} dts - All dts
 * @param {DragTransform} dt - Current dt
 * @returns {DragTransform} - Absolute dt
 */
export const getAbsoluteDragTransform = <T extends { id: number }>(
    t: Tree<T>,
    id: number,
    dts: Record<number, DragTransform>,
    dt: DragTransform = dts[t.data.id] ?? { x: 0, y: 0 },
): DragTransform | undefined => {
    if (t.data.id === id) {
        return dt;
    }

    for (const c of t.children) {
        const cdt = dts[c.data.id] ?? { x: 0, y: 0 };
        const res = getAbsoluteDragTransform(c, id, dts, {
            x: dt.x + cdt.x,
            y: dt.y + cdt.y,
        });
        if (res !== undefined) {
            return res;
        }
    }

    return;
};

/**
 * Gets all closed leaves
 * @param {Tree<T>} t - The tree
 * @returns {Array<Tree<T>>} - All closed leaves
 */
export const getClosedLeaves = <T extends { closeRef: number | null }>(
    t: Tree<T>,
): Array<Tree<T>> => filterTree(t, (c) => c.data.closeRef !== null);

const getLinks = <T extends { id: number }>(t: Tree<T>): Link[] => {
    const links: Link[] = t.children.map((c) => ({
        source: [t.x, t.y],
        target: [c.x, c.y],
        srcId: t.data.id,
        targetId: c.data.id,
    }));

    return links.concat(...t.children.map((c) => getLinks(c)));
};

export const layout = <T>(t: Tree<T>) => {
    firstWalk(t);
    secondWalk(t, 0);
};

const firstWalk = <T>(t: Tree<T>) => {
    if (!t.children.length) {
        setExtremes(t);
        return;
    }
    firstWalk(t.children[0]);

    let ih = updateIYL(bottom(t.children[0].extremeLeft!), 0);

    for (let i = 1; i < t.children.length; i++) {
        const c = t.children[i];
        firstWalk(c);
        const minY = bottom(c.extremeRight!);
        separate(t, i, ih);
        ih = updateIYL(minY, i, ih);
    }
    positionRoot(t);
    setExtremes(t);
};

const setExtremes = <T>(t: Tree<T>) => {
    if (t.children.length) {
        t.extremeLeft = t.children[0].extremeLeft;
        t.modsEl = t.children[0].modsEl;
        t.extremeRight = t.children[t.children.length - 1].extremeRight;
        t.modsEr = t.children[t.children.length - 1].modsEr;
    } else {
        t.extremeLeft = t;
        t.extremeRight = t;
        t.modsEl = 0;
        t.modsEr = 0;
    }
};

/**
 * Shift child-trees so they no longer overlap
 * @param {Tree<T>} t - Current tree
 * @param {number} i - The id of the child to move
 * @param {LeftSiblingList} ih - A linked list of the indexes of left siblings and their lowest vertical coordinate.
 * @returns {void} - void
 */
const separate = <T>(t: Tree<T>, i: number, ih: LeftSiblingList) => {
    let sr: Tree<T> | undefined = t.children[i - 1];
    let mssr = sr.mod;
    let cl: Tree<T> | undefined = t.children[i];
    let mscl = cl.mod;

    let ihIt: LeftSiblingList | undefined = ih;

    while (sr && cl) {
        if (bottom(sr) > ihIt!.lowY) {
            ihIt = ih.next;
        }
        const dist = mssr + sr.prelim + sr.width - (mscl + cl.prelim);
        if (dist > 0) {
            mscl += dist;
            moveSubTree(t, i, ihIt!.idx, dist);
        }
        const sy = bottom(sr);
        const cy = bottom(cl);
        if (sy >= cy) {
            sr = nextRightContour(sr);
            if (sr) {
                mssr += sr.mod;
            }
        }
        if (sy < cy) {
            continue;
        }
        cl = nextLeftContour(cl);
        if (cl) {
            mscl += cl.mod;
        }
    }

    if (!sr && cl) {
        setLeftThread(t, i, cl, mscl);
    } else if (sr && !cl) {
        setRightThread(t, i, sr, mssr);
    }
};

const moveSubTree = <T>(t: Tree<T>, i: number, si: number, dist: number) => {
    t.children[i].mod += dist;
    t.children[i].modsEl += dist;
    t.children[i].modsEr += dist;
    distributeExtra(t, i, si, dist);
};

// A contour are just the children you can see from the side

const nextLeftContour = <T>(t: Tree<T>) =>
    t.children.length ? t.children[0] : t.tl;

const nextRightContour = <T>(t: Tree<T>) =>
    t.children.length ? t.children[t.children.length - 1] : t.tr;

const bottom = <T>(t: Tree<T>) => t.y + t.height;

const setLeftThread = <T>(
    t: Tree<T>,
    i: number,
    cl: Tree<T>,
    modSumCl: number,
) => {
    const li = t.children[0].extremeLeft!;
    li.tl = cl;
    const diff = modSumCl - cl.mod - t.children[0].modsEl;
    li.mod += diff;
    li.prelim -= diff;
    t.children[0].extremeLeft = t.children[i].extremeLeft!;
    t.children[0].modsEl = t.children[i].modsEl;
};

const setRightThread = <T>(
    t: Tree<T>,
    i: number,
    sr: Tree<T>,
    modSumSr: number,
) => {
    const ri = t.children[i].extremeRight!;
    ri.tr = sr;
    const diff = modSumSr - sr.mod - t.children[i].modsEr;
    ri.mod += diff;
    ri.prelim -= diff;
    t.children[i].extremeRight = t.children[i - 1].extremeRight!;
    t.children[i].modsEr = t.children[i - 1].modsEr;
};

const positionRoot = <T>(t: Tree<T>) => {
    t.prelim =
        (t.children[0].prelim +
            t.children[0].mod +
            t.children[t.children.length - 1].mod +
            t.children[t.children.length - 1].prelim +
            t.children[t.children.length - 1].width) /
            2 -
        t.width / 2;
};

const secondWalk = <T>(t: Tree<T>, modSum: number) => {
    modSum += t.mod;
    t.x = t.prelim + modSum + t.width / 2;
    addChildSpacing(t);
    for (const c of t.children) {
        secondWalk(c, modSum);
    }
};

const distributeExtra = <T>(
    t: Tree<T>,
    i: number,
    si: number,
    dist: number,
) => {
    if (si === i - 1) {
        return;
    }
    const nr = i - si;
    t.children[si + 1].shift += dist / nr;
    t.children[i].shift -= dist / nr;
    t.children[i].change -= dist - dist / nr;
};

const addChildSpacing = <T>(t: Tree<T>) => {
    let d = 0;
    let modSumDelta = 0;

    for (const c of t.children) {
        d += c.shift;
        modSumDelta += d + c.change;
        c.mod += modSumDelta;
    }
};

const iyl = (
    lowY: number,
    idx: number,
    next?: LeftSiblingList,
): LeftSiblingList => ({ lowY, idx, next });

const updateIYL = (
    minY: number,
    i: number,
    ih?: LeftSiblingList,
): LeftSiblingList => {
    while (ih && minY >= ih.lowY) {
        ih = ih.next;
    }
    return iyl(minY, i, ih);
};

const treeWidth = <T>(t: Tree<T>): number => {
    const width = t.x + t.width / 2;
    if (t.children.length) {
        return Math.max(width, treeWidth(t.children[t.children.length - 1]));
    }
    return width;
};
