import { TableauxState, TableauxType } from "../../../types/tableaux";

const example: TableauxState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: true },
                    { lit: "c", negated: false }
                ]
            },
            { atoms: [{ lit: "a", negated: false }] },
            { atoms: [{ lit: "c", negated: true }] }
        ]
    },
    type: TableauxType.unconnected,
    regular: false,
    nodes: [
        {
            parent: null,
            spelling: "true",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [1, 2]
        },
        {
            parent: 0,
            spelling: "a",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [3]
        },
        {
            parent: 0,
            spelling: "c",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [4]
        },
        {
            parent: 1,
            spelling: "a",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: []
        },
        {
            parent: 2,
            spelling: "c",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: []
        }
    ],
    seal: "8BBC0009855AECFF0AB4B574A5B80B79DA98CC27F9B1746B09833050F6CC28F8"
};

export default example;
