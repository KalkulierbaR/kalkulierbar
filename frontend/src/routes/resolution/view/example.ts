import {
    FOResolutionState,
    PropResolutionState,
} from "../../../types/resolution";

export const propExample: PropResolutionState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: false },
                    { lit: "b", negated: true },
                    { lit: "c", negated: false },
                ],
            },
            {
                atoms: [
                    { lit: "c", negated: true },
                    { lit: "a", negated: true },
                    { lit: "d", negated: true },
                ],
            },
            {
                atoms: [
                    { lit: "d", negated: false },
                    { lit: "c", negated: false },
                ],
            },
            {
                atoms: [
                    { lit: "b", negated: true },
                    { lit: "a", negated: false },
                ],
            },
            { atoms: [{ lit: "a", negated: true }] },
            {
                atoms: [
                    { lit: "b", negated: false },
                    { lit: "c", negated: false },
                ],
            },
            { atoms: [{ lit: "c", negated: true }] },
        ],
    },
    highlightSelectable: false,
    newestNode: -1,
    hiddenClauses: { clauses: [] },
    seal: "778287DD65F50BCE5C2E67758FFD0B079820CCC0D5FC1F5A79A2108D875958E8",
};

export const foExample: FOResolutionState = {
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
        ],
    },
    highlightSelectable: false,
    newestNode: -1,
    hiddenClauses: { clauses: [] },
    seal: "EE642BDA392ED4A7F1748F7C924CD838E4AB3A94A7957B2036A7AC6F8825FCBE",
};
