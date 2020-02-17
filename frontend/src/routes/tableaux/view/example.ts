import {FOTableauxState, PropTableauxState, TableauxType} from "../../../types/tableaux";

export const propExample: PropTableauxState = {
    "clauseSet": {
        "clauses": [{
            "atoms": [{"lit": "a", "negated": true}, {
                "lit": "c",
                "negated": false
            }]
        }, {"atoms": [{"lit": "a", "negated": false}]}, {"atoms": [{"lit": "c", "negated": true}]}]
    },
    "type": TableauxType.unconnected,
    "regular": false,
    "backtracking": true,
    "nodes": [{
        "parent": null,
        "spelling": "true",
        "negated": false,
        "isClosed": false,
        "closeRef": null,
        "children": [1, 2]
    }, {
        "parent": 0,
        "spelling": "a",
        "negated": true,
        "isClosed": false,
        "closeRef": null,
        "children": [3]
    }, {
        "parent": 0,
        "spelling": "c",
        "negated": false,
        "isClosed": false,
        "closeRef": null,
        "children": [4]
    }, {
        "parent": 1,
        "spelling": "a",
        "negated": false,
        "isClosed": false,
        "closeRef": null,
        "children": []
    }, {"parent": 2, "spelling": "c", "negated": true, "isClosed": false, "closeRef": null, "children": []}],
    "moveHistory": [{"type": "EXPAND", "id1": 0, "id2": 0}, {"type": "EXPAND", "id1": 1, "id2": 1}, {
        "type": "EXPAND",
        "id1": 2,
        "id2": 2
    }],
    "usedBacktracking": false,
    "seal": "D2A6057DD55D161AA29B0E00D0E9B7CC750EEA2C6372A7A96740123385CE50CE"
};

export const foExample: FOTableauxState = {
    "clauseSet": {
        "clauses": [{
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "kalkulierbar.logic.Function",
                        "spelling": "f",
                        "arguments": [{"type": "kalkulierbar.logic.QuantifiedVariable", "spelling": "X"}]
                    }]
                }, "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "kalkulierbar.logic.Function",
                        "spelling": "f",
                        "arguments": [{"type": "kalkulierbar.logic.Constant", "spelling": "a"}]
                    }]
                }, "negated": false
            }, {
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "kalkulierbar.logic.Function",
                        "spelling": "f",
                        "arguments": [{"type": "kalkulierbar.logic.Constant", "spelling": "b"}]
                    }]
                }, "negated": true
            }]
        }, {
            "atoms": [{
                "lit": {
                    "spelling": "R",
                    "arguments": [{
                        "type": "kalkulierbar.logic.Function",
                        "spelling": "f",
                        "arguments": [{"type": "kalkulierbar.logic.QuantifiedVariable", "spelling": "Xv1"}]
                    }]
                }, "negated": false
            }]
        }]
    },
    "formula": "\\all X: !R(f(X)) & (R(f(a)) | !R(f(b))) & \\all X: R(f(X))",
    "type": TableauxType.unconnected,
    "regular": false,
    "backtracking": true,
    "manualVarAssign": false,
    "nodes": [{
        "parent": null,
        "relation": {"spelling": "true", "arguments": []},
        "negated": false,
        "isClosed": false,
        "closeRef": null,
        "children": [1, 2],
        "spelling": "true()"
    }, {
        "parent": 0,
        "relation": {
            "spelling": "R",
            "arguments": [{
                "type": "kalkulierbar.logic.Function",
                "spelling": "f",
                "arguments": [{"type": "kalkulierbar.logic.Constant", "spelling": "a"}]
            }]
        },
        "negated": false,
        "isClosed": false,
        "closeRef": null,
        "children": [3],
        "spelling": "R(f(a))"
    }, {
        "parent": 0,
        "relation": {
            "spelling": "R",
            "arguments": [{
                "type": "kalkulierbar.logic.Function",
                "spelling": "f",
                "arguments": [{"type": "kalkulierbar.logic.Constant", "spelling": "b"}]
            }]
        },
        "negated": true,
        "isClosed": false,
        "closeRef": null,
        "children": [],
        "spelling": "R(f(b))"
    }, {
        "parent": 1,
        "relation": {
            "spelling": "R",
            "arguments": [{
                "type": "kalkulierbar.logic.Function",
                "spelling": "f",
                "arguments": [{"type": "kalkulierbar.logic.QuantifiedVariable", "spelling": "Xv2"}]
            }]
        },
        "negated": true,
        "isClosed": false,
        "closeRef": null,
        "children": [],
        "spelling": "R(f(Xv2))"
    }],
    "moveHistory": [{"type": "EXPAND", "id1": 0, "id2": 1, "varAssign": {}}, {
        "type": "EXPAND",
        "id1": 1,
        "id2": 0,
        "varAssign": {}
    }],
    "usedBacktracking": false,
    "expansionCounter": 2,
    "seal": "D51F2D4BDAC3353CF6A55515C9058AEFDC51ED19F2E1921DB936D366B0CE51F8",
    "renderedClauseSet": ["!R(f(X))", "R(f(a)), !R(f(b))", "R(f(Xv1))"]
};