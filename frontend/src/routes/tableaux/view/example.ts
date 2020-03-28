import {
    FOTableauxState,
    PropTableauxState,
    TableauxType,
} from "../../../types/calculus/tableaux";

export const propExample: PropTableauxState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: true },
                    {
                        lit: "c",
                        negated: false,
                    },
                ],
            },
            { atoms: [{ lit: "a", negated: false }] },
            { atoms: [{ lit: "c", negated: true }] },
        ],
    },
    type: TableauxType.unconnected,
    regular: false,
    backtracking: true,
    nodes: [
        {
            parent: null,
            spelling: "true",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [1, 2],
        },
        {
            parent: 0,
            spelling: "a",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [3],
        },
        {
            parent: 0,
            spelling: "c",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [4],
        },
        {
            parent: 1,
            spelling: "a",
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [],
        },
        {
            parent: 2,
            spelling: "c",
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [],
        },
    ],
    moveHistory: [
        { type: "tableaux-expand", id1: 0, id2: 0 },
        { type: "tableaux-expand", id1: 1, id2: 1 },
        {
            type: "tableaux-expand",
            id1: 2,
            id2: 2,
        },
    ],
    usedBacktracking: false,
    seal: "8730EA61E695FB8046FEB1EBEDB3984DC8B06F66185EB334BD20208C24E77F45",
};

export const foExample: FOTableauxState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    {
                        lit: {
                            spelling: "R",
                            arguments: [
                                {
                                    type: "Function",
                                    spelling: "f",
                                    arguments: [
                                        {
                                            type: "QuantifiedVariable",
                                            spelling: "X",
                                        },
                                    ],
                                },
                            ],
                        },
                        negated: true,
                    },
                ],
            },
            {
                atoms: [
                    {
                        lit: {
                            spelling: "R",
                            arguments: [
                                {
                                    type: "Function",
                                    spelling: "f",
                                    arguments: [
                                        {
                                            type: "Constant",
                                            spelling: "a",
                                        },
                                    ],
                                },
                            ],
                        },
                        negated: false,
                    },
                    {
                        lit: {
                            spelling: "R",
                            arguments: [
                                {
                                    type: "Function",
                                    spelling: "f",
                                    arguments: [
                                        {
                                            type: "Constant",
                                            spelling: "b",
                                        },
                                    ],
                                },
                            ],
                        },
                        negated: true,
                    },
                ],
            },
            {
                atoms: [
                    {
                        lit: {
                            spelling: "R",
                            arguments: [
                                {
                                    type: "Function",
                                    spelling: "f",
                                    arguments: [
                                        {
                                            type: "QuantifiedVariable",
                                            spelling: "Xv1",
                                        },
                                    ],
                                },
                            ],
                        },
                        negated: false,
                    },
                ],
            },
        ],
    },
    formula: "\\all X: !R(f(X)) & (R(f(a)) | !R(f(b))) & \\all X: R(f(X))",
    type: TableauxType.unconnected,
    regular: false,
    backtracking: true,
    manualVarAssign: false,
    nodes: [
        {
            parent: null,
            relation: { spelling: "true", arguments: [] },
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [1, 2],
            spelling: "true()",
        },
        {
            parent: 0,
            relation: {
                spelling: "R",
                arguments: [
                    {
                        type: "Function",
                        spelling: "f",
                        arguments: [{ type: "Constant", spelling: "a" }],
                    },
                ],
            },
            negated: false,
            isClosed: false,
            closeRef: null,
            children: [3],
            spelling: "R(f(a))",
        },
        {
            parent: 0,
            relation: {
                spelling: "R",
                arguments: [
                    {
                        type: "Function",
                        spelling: "f",
                        arguments: [{ type: "Constant", spelling: "b" }],
                    },
                ],
            },
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [],
            spelling: "R(f(b))",
        },
        {
            parent: 1,
            relation: {
                spelling: "R",
                arguments: [
                    {
                        type: "Function",
                        spelling: "f",
                        arguments: [
                            {
                                type: "QuantifiedVariable",
                                spelling: "X_2",
                            },
                        ],
                    },
                ],
            },
            negated: true,
            isClosed: false,
            closeRef: null,
            children: [],
            spelling: "R(f(X_2))",
        },
    ],
    moveHistory: [
        { type: "tableaux-expand", id1: 0, id2: 1 },
        {
            type: "tableaux-expand",
            id1: 1,
            id2: 0,
        },
    ],
    usedBacktracking: false,
    expansionCounter: 2,
    seal: "C40FE5C4B0B780B997866215ED2D67BA1F9E3EDF5EBD35D250DF5488DE147D0B",
    renderedClauseSet: ["!R(f(X))", "R(f(a)), !R(f(b))", "R(f(Xv1))"],
    statusMessage: null,
};
