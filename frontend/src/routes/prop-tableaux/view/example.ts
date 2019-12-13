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
    seal: "145EFCF5C1F92835DF727F79F47FEB808AC9BB397337D6460B36EF49871A3A38"
};

export default example;
