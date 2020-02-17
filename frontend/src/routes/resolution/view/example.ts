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
    "clauseSet": {
        "clauses": [{
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "Function",
                        "spelling": "f",
                        "arguments": [{"type": "QuantifiedVariable", "spelling": "X"}, {
                            "type": "Constant",
                            "spelling": "a"
                        }]
                    }]
                }, "negated": false
            }]
        }, {
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "Function",
                        "spelling": "f",
                        "arguments": [{"type": "Constant", "spelling": "sk1"}, {"type": "Constant", "spelling": "a"}]
                    }]
                }, "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "b"}]},
                "negated": false
            }, {"lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "b"}]}, "negated": false}]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "b"}]},
                "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "Function",
                        "spelling": "f",
                        "arguments": [{"type": "Constant", "spelling": "c"}, {"type": "Constant", "spelling": "a"}]
                    }]
                }, "negated": false
            }]
        }]
    },
    "highlightSelectable": false,
    "newestNode": -1,
    "hiddenClauses": {"clauses": []},
    "seal": "6BD93982990DDA79E1BBBF5506C30B3577F070FC7AE1255D75E817DE3FF90CBE"
};
