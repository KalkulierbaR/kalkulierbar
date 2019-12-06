import { TableauxNode } from "../types/tableaux";

export const nextOpenLeaf = (nodes: TableauxNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isClosed && n.children.length === 0) {
            return i;
        }
    }
    return undefined;
};
