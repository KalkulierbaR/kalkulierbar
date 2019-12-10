import { TableauxState } from "../../../types/tableaux";

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
    seal: "395BF8F6762FD0A3588B5E4745E32ECC98F6BE8C2FD5EBFDF97CD1A7E5B1FF74"
};

export default example;
