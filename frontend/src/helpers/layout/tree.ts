import { Layout } from "../../types/layout";
import { TableauxNode } from "../../types/tableaux";
import { LeftSiblingList, Tree } from "../../types/tree";

export const treeLayout = (nodes: TableauxNode[]): Layout<TableauxNode> => {
    return { width: 0, height: 0, data: [] };
};

const tabNodeToTree = () => {};

const layout = <T>(t: Tree<T>) => {
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
    if (!t.children.length) {
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
        if (sy >= cy) {
            cl = nextLeftContour(cl);
            if (cl) {
                mscl += cl.mod;
            }
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

const nextLeftContour = <T>(t: Tree<T>) =>
    t.children.length ? t.children[0] : t.tl;

const nextRightContour = <T>(t: Tree<T>) =>
    t.children.length ? t.children[t.children.length - 1] : t.tr;

const bottom = <T>(t: Tree<T>) => t.y + t.height;

const setLeftThread = <T>(
    t: Tree<T>,
    i: number,
    cl: Tree<T>,
    modSumCl: number
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
    modSumSr: number
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
    t.x = t.prelim + modSum;
    addChildSpacing(t);
    for (const c of t.children) {
        secondWalk(c, modSum);
    }
};

const distributeExtra = <T>(
    t: Tree<T>,
    i: number,
    si: number,
    dist: number
) => {
    if (si === i - 1) {
        return;
    }
    const nr = i - si;
    t.children[si + 1].shift += dist / nr;
    t.children[i].shift -= dist / nr;
    t.children[i].change -= dist / nr;
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
    next?: LeftSiblingList
): LeftSiblingList => ({ lowY, idx, next });

const updateIYL = (
    minY: number,
    i: number,
    ih?: LeftSiblingList
): LeftSiblingList => {
    while (ih && minY >= ih.lowY) {
        ih = ih.next;
    }
    return iyl(minY, i, ih);
};
