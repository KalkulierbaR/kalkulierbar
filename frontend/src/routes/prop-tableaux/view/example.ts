import { TableauxState } from "../../../types/tableaux";

const example: TableauxState = {
    clauseSet: { clauses: [] },
    nodes: [
        {
            parent: 0,
            spelling: "true",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [1, 4]
        },
        {
            parent: 0,
            spelling: "a",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [2]
        },
        {
            parent: 1,
            spelling: "b",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [3]
        },
        {
            parent: 2,
            spelling: "a",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: []
        },
        {
            parent: 0,
            spelling: "c",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [5]
        },
        {
            parent: 4,
            spelling: "c",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: []
        }
    ],
    seal: "C07111CDE406BDAF2E34AC713FBC2FA5A4E7FAD84C44F23F86AB54BBE5893F8D"
};

export default example;
