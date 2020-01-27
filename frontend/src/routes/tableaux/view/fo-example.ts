import {FoTableauxState, TableauxType} from "../../../types/tableaux";

const foExample: FoTableauxState = {
        "clauseSet": {
            "clauses": [{
                "atoms": [{
                    "lit": {
                        "spelling": "R",
                        "arguments": [{"type": "kalkulierbar.logic.QuantifiedVariable", "spelling": "X"}]
                    }, "negated": false
                }]
            }, {
                "atoms": [{
                    "lit": {
                        "spelling": "R",
                        "arguments": [{"type": "kalkulierbar.logic.Constant", "spelling": "sk1"}]
                    }, "negated": true
                }]
            }]
        },
        "formula": "\\all X: R(X) & \\ex X: !R(X)",
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
            "children": [],
            "spelling": "true()"
        }],
        "moveHistory": [],
        "usedBacktracking": false,
        "expansionCounter": 0,
        "seal": "10CF4E0CEF4DB4F67025E580C16EC5923FFB6C90DD46971F7E83066C16D58A05",
        "renderedClauseSet": ["R(X)", "!R(sk1)"]
    };

export default foExample;
