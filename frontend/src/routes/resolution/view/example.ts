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

// Used formula: R(a) & /all X: R(f(b, X)) & (!R(f(b, a)) | !R(f(b, a))) & (!R(a) | !R(a) | !R(a)) & /ex Y: Q(Y) & !Q(c)
export const foExample: FOResolutionState = {
    "clauseSet": {
        "clauses": [{
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
                            "spelling": "X"
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
                        "arguments": [{"type": "Constant", "spelling": "b"}, {"type": "Constant", "spelling": "a"}]
                    }]
                }, "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "a"}]},
                "negated": true
            }, {
                "lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "a"}]},
                "negated": true
            }, {"lit": {"spelling": "R", "arguments": [{"type": "Constant", "spelling": "a"}]}, "negated": true}]
        }, {
            "atoms": [{
                "lit": {"spelling": "Q", "arguments": [{"type": "Constant", "spelling": "sk1"}]},
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
    "seal": "07547B594BC20F191A937653302959C8A076EB88D09608EEAB4352564A4045BA"
};
