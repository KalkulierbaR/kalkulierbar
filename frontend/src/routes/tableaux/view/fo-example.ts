import {FOTableauxState, TableauxType} from "../../../types/tableaux";

const foExample: FOTableauxState = {
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
        "isLemma": false,
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
        "isLemma": false,
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
        "isLemma": false,
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
                "arguments": [{"type": "kalkulierbar.logic.QuantifiedVariable", "spelling": "X_2"}]
            }]
        },
        "negated": true,
        "isLemma": false,
        "isClosed": false,
        "closeRef": null,
        "children": [],
        "spelling": "R(f(X_2))"
    }],
    "moveHistory": [{"type": "EXPAND", "id1": 0, "id2": 1, "varAssign": {}}, {
        "type": "EXPAND",
        "id1": 1,
        "id2": 0,
        "varAssign": {}
    }],
    "usedBacktracking": false,
    "expansionCounter": 2,
    "seal": "D9CBFCD29C08A89041652FE3A8276DFEDE29D994E59A21AA99D4A553415E9F58",
    "renderedClauseSet": ["!R(f(X))", "R(f(a)), !R(f(b))", "R(f(Xv1))"]
};

export default foExample;
