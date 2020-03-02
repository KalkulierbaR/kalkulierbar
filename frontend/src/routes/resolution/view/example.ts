import {FOResolutionState, PropResolutionState, VisualHelp,} from "../../../types/resolution";

export const propExample: PropResolutionState = {
    "clauseSet": {
        "clauses": [{
            "atoms": [{
                "lit": "a",
                "negated": false
            }, {"lit": "b", "negated": false}, {"lit": "c", "negated": false}]
        }, {
            "atoms": [{"lit": "c", "negated": true}, {"lit": "a", "negated": false}, {
                "lit": "a",
                "negated": false
            }, {"lit": "d", "negated": true}]
        }, {"atoms": [{"lit": "d", "negated": false}, {"lit": "d", "negated": false}]}, {
            "atoms": [{
                "lit": "b",
                "negated": true
            }, {"lit": "a", "negated": false}]
        }, {"atoms": [{"lit": "a", "negated": true}]}, {
            "atoms": [{
                "lit": "c",
                "negated": false
            }]
        }, {"atoms": [{"lit": "b", "negated": false}]}]
    },
    "visualHelp": VisualHelp.highlight,
    "newestNode": -1,
    "hiddenClauses": {"clauses": []},
    "seal": "6D15F02BA4433745D2FFDDF4E215D5667E84ABA89B3E0DF1FD2D6375DA032EDF"
};

// Used formula: R(b) & R(c) & R(a) & /all X: R(f(b, X)) & (!R(f(b, a)) | !R(f(b, b))) & (!R(a) | !R(b) | !R(c)) & /all Y: Q(Y) & !Q(c)
export const foExample: FOResolutionState = {
    "clauseSet": {
        "clauses": [{
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "b"}]},
                "negated": false
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "c"}]},
                "negated": false
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "a"}]},
                "negated": false
            }]
        }, {
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "Function",
                        "spelling": "f",
                        "arguments": [{"type": "Constant", "spelling": "b"}, {
                            "type": "QuantifiedVariable",
                            "spelling": "X_4"
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
                        "arguments": [{"type": "Constant", "spelling": "b"}, {"type": "Constant", "spelling": "a"}]
                    }]
                }, "negated": true
            }, {
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "Function",
                        "spelling": "f",
                        "arguments": [{"type": "Constant", "spelling": "b"}, {"type": "Constant", "spelling": "b"}]
                    }]
                }, "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "a"}]},
                "negated": true
            }, {
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "b"}]},
                "negated": true
            }, {"lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "c"}]}, "negated": true}]
        }, {
            "atoms": [{
                "lit": {"spelling": "Q", "arguments": [{"type": "QuantifiedVariable", "spelling": "Y_7"}]},
                "negated": false
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "Q", "arguments": [{"type": "Constant", "spelling": "c"}]},
                "negated": true
            }]
        }]
    },
    "visualHelp": VisualHelp.highlight,
    "newestNode": -1,
    "hiddenClauses": {"clauses": []},
    "clauseCounter": 8,
    "seal": "196976513C2CF3237A499CE786D476733DF97B1199D8C7E26EAB89A210144A7F"
};
