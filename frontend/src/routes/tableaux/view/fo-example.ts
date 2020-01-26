import {FoTableauxState, TableauxType} from "../../../types/tableaux";

const foExample: FoTableauxState = {
        "clauseSet": {
            "clauses": [
                {
                    "atoms": [
                        {
                            "lit": {
                                "spelling": "P",
                                "arguments": [
                                    {
                                        "type": "kalkulierbar.logic.QuantifiedVariable",
                                        "spelling": "X"
                                    }
                                ]
                            },
                            "negated": false
                        }
                    ]
                },
                {
                    "atoms": [
                        {
                            "lit": {
                                "spelling": "P",
                                "arguments": [
                                    {
                                        "type": "kalkulierbar.logic.QuantifiedVariable",
                                        "spelling": "Y"
                                    }
                                ]
                            },
                            "negated": true
                        }
                    ]
                }
            ]
        },
        "formula": "\\all X: P(X) & \\all Y: !P(Y)",
        "type": TableauxType.unconnected,
        "regular": false,
        "backtracking": false,
        "nodes": [
            {
                "parent": null,
                "relation": {
                    "spelling": "true",
                    "arguments": []
                },
                "negated": false,
                "isClosed": false,
                "closeRef": null,
                "children": [],
                "spelling": "true()"
            }
        ],
        "moveHistory": [],
        "usedBacktracking": false,
        "expansionCounter": 0,
        "manualVarAssign": false,
        "seal": "06BCC3ECA6B357691B7786F96F53E2875BF0573BB0A4B3362C0A371847B6A3D5",
        "renderedClauseSet": [
            "P(X)",
            "!P(Y)"
        ]
    }
;

export default foExample;
