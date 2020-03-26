import { NCTableauxState } from "../../../types/nc-tableaux";

const exampleState: NCTableauxState = {
    formula: {
        type: "and",
        leftChild: {
            type: "and",
            leftChild: {
                type: "allquant",
                varName: "X",
                child: {
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
                                        type: "QuantifiedVariable",
                                        spelling: "X",
                                    },
                                ],
                            },
                        ],
                    },
                },
                boundVariables: [{ spelling: "X" }],
            },
            rightChild: {
                type: "or",
                leftChild: {
                    type: "relation",
                    spelling: "R",
                    arguments: [
                        {
                            type: "Function",
                            spelling: "f",
                            arguments: [{ type: "Constant", spelling: "a" }],
                        },
                    ],
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
                                ],
                            },
                        ],
                    },
                },
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
                            { type: "QuantifiedVariable", spelling: "X" },
                        ],
                    },
                ],
            },
            boundVariables: [{ spelling: "X" }],
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
                        type: "allquant",
                        varName: "X",
                        child: {
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
                                                type: "QuantifiedVariable",
                                                spelling: "X",
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                        boundVariables: [{ spelling: "X" }],
                    },
                    rightChild: {
                        type: "or",
                        leftChild: {
                            type: "relation",
                            spelling: "R",
                            arguments: [
                                {
                                    type: "Function",
                                    spelling: "f",
                                    arguments: [
                                        { type: "Constant", spelling: "a" },
                                    ],
                                },
                            ],
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
                                        ],
                                    },
                                ],
                            },
                        },
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
            isClosed: false,
            closeRef: null,
            children: [],
            spelling:
                "(((∀X: ¬R(f(X))) ∧ (R(f(a)) ∨ ¬R(f(b)))) ∧ (∀X: R(f(X))))",
        },
    ],
    moveHistory: [],
    identifiers: ["X", "R", "f", "a", "b"],
    usedBacktracking: false,
    gammaSuffixCounter: 0,
    skolemCounter: 0,
    seal: "0272C639650E0F0D9B9FA4A07D20FCE7BF01AB43ACF78AC46BEE13E4F0FA8C74",
};

export default exampleState;
