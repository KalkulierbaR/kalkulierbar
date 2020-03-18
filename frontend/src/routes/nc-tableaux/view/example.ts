import { NCTableauxState } from "../../../types/nc-tableaux";

const exampleState: NCTableauxState = {
    formula: {
        type: "and",
        leftChild: {
            type: "and",
            leftChild: {
                type: "and",
                leftChild: {
                    type: "and",
                    leftChild: {
                        type: "and",
                        leftChild: {
                            type: "and",
                            leftChild: {
                                type: "and",
                                leftChild: {
                                    type: "relation",
                                    spelling: "R",
                                    arguments: [
                                        { type: "Constant", spelling: "b" },
                                    ],
                                },
                                rightChild: {
                                    type: "relation",
                                    spelling: "R",
                                    arguments: [
                                        { type: "Constant", spelling: "c" },
                                    ],
                                },
                            },
                            rightChild: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    { type: "Constant", spelling: "a" },
                                ],
                            },
                        },
                        rightChild: {
                            type: "allquant",
                            varName: "X",
                            child: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    {
                                        type: "Function",
                                        spelling: "f",
                                        arguments: [
                                            { type: "Constant", spelling: "b" },
                                            {
                                                type: "QuantifiedVariable",
                                                spelling: "X",
                                            },
                                        ],
                                    },
                                ],
                            },
                            boundVariables: [{ spelling: "X" }],
                        },
                    },
                    rightChild: {
                        type: "or",
                        leftChild: {
                            type: "not",
                            child: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    {
                                        type: "Function",
                                        spelling: "f",
                                        arguments: [
                                            { type: "Constant", spelling: "b" },
                                            { type: "Constant", spelling: "a" },
                                        ],
                                    },
                                ],
                            },
                        },
                        rightChild: {
                            type: "not",
                            child: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    {
                                        type: "Function",
                                        spelling: "f",
                                        arguments: [
                                            { type: "Constant", spelling: "b" },
                                            { type: "Constant", spelling: "b" },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                rightChild: {
                    type: "or",
                    leftChild: {
                        type: "or",
                        leftChild: {
                            type: "not",
                            child: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    { type: "Constant", spelling: "a" },
                                ],
                            },
                        },
                        rightChild: {
                            type: "not",
                            child: {
                                type: "relation",
                                spelling: "R",
                                arguments: [
                                    { type: "Constant", spelling: "b" },
                                ],
                            },
                        },
                    },
                    rightChild: {
                        type: "not",
                        child: {
                            type: "relation",
                            spelling: "R",
                            arguments: [{ type: "Constant", spelling: "c" }],
                        },
                    },
                },
            },
            rightChild: {
                type: "allquant",
                varName: "Y",
                child: {
                    type: "relation",
                    spelling: "Q",
                    arguments: [{ type: "QuantifiedVariable", spelling: "Y" }],
                },
                boundVariables: [{ spelling: "Y" }],
            },
        },
        rightChild: {
            type: "not",
            child: {
                type: "relation",
                spelling: "Q",
                arguments: [{ type: "Constant", spelling: "c" }],
            },
        },
    },
    backtracking: true,
    nodes: [
        {
            parent: null,
            formula: {
                type: "and",
                leftChild: {
                    type: "and",
                    leftChild: {
                        type: "and",
                        leftChild: {
                            type: "and",
                            leftChild: {
                                type: "and",
                                leftChild: {
                                    type: "and",
                                    leftChild: {
                                        type: "and",
                                        leftChild: {
                                            type: "relation",
                                            spelling: "R",
                                            arguments: [
                                                {
                                                    type: "Constant",
                                                    spelling: "b",
                                                },
                                            ],
                                        },
                                        rightChild: {
                                            type: "relation",
                                            spelling: "R",
                                            arguments: [
                                                {
                                                    type: "Constant",
                                                    spelling: "c",
                                                },
                                            ],
                                        },
                                    },
                                    rightChild: {
                                        type: "relation",
                                        spelling: "R",
                                        arguments: [
                                            { type: "Constant", spelling: "a" },
                                        ],
                                    },
                                },
                                rightChild: {
                                    type: "allquant",
                                    varName: "X",
                                    child: {
                                        type: "relation",
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
                                                    {
                                                        type:
                                                            "QuantifiedVariable",
                                                        spelling: "X",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    boundVariables: [{ spelling: "X" }],
                                },
                            },
                            rightChild: {
                                type: "or",
                                leftChild: {
                                    type: "not",
                                    child: {
                                        type: "relation",
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
                                                    {
                                                        type: "Constant",
                                                        spelling: "a",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                                rightChild: {
                                    type: "not",
                                    child: {
                                        type: "relation",
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
                                                    {
                                                        type: "Constant",
                                                        spelling: "b",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                        rightChild: {
                            type: "or",
                            leftChild: {
                                type: "or",
                                leftChild: {
                                    type: "not",
                                    child: {
                                        type: "relation",
                                        spelling: "R",
                                        arguments: [
                                            { type: "Constant", spelling: "a" },
                                        ],
                                    },
                                },
                                rightChild: {
                                    type: "not",
                                    child: {
                                        type: "relation",
                                        spelling: "R",
                                        arguments: [
                                            { type: "Constant", spelling: "b" },
                                        ],
                                    },
                                },
                            },
                            rightChild: {
                                type: "not",
                                child: {
                                    type: "relation",
                                    spelling: "R",
                                    arguments: [
                                        { type: "Constant", spelling: "c" },
                                    ],
                                },
                            },
                        },
                    },
                    rightChild: {
                        type: "allquant",
                        varName: "Y",
                        child: {
                            type: "relation",
                            spelling: "Q",
                            arguments: [
                                { type: "QuantifiedVariable", spelling: "Y" },
                            ],
                        },
                        boundVariables: [{ spelling: "Y" }],
                    },
                },
                rightChild: {
                    type: "not",
                    child: {
                        type: "relation",
                        spelling: "Q",
                        arguments: [{ type: "Constant", spelling: "c" }],
                    },
                },
            },
            isClosed: false,
            closeRef: null,
            children: [],
            spelling:
                "(((((((R(b) ∧ R(c)) ∧ R(a)) ∧ (∀X: R(f(b, X)))) ∧ (¬R(f(b, a)) ∨ ¬R(f(b, b)))) ∧ ((¬R(a) ∨ ¬R(b)) ∨ ¬R(c))) ∧ (∀Y: Q(Y))) ∧ ¬Q(c))",
            isLeaf: true,
        },
    ],
    moveHistory: [],
    usedBacktracking: false,
    expansionCounter: 0,
    seal: "F84F6DA714EE82F5A0CE2ACB30CBF6D3235C6F9D98896860FCD89A074860189D",
};

export default exampleState;
