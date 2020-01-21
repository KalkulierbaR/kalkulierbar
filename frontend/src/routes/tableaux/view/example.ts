import {TableauxState, TableauxType} from "../../../types/tableaux";

const example: TableauxState = {
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
    "undoEnable": true,
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
    "usedUndo": false,
    "seal": "D2A6057DD55D161AA29B0E00D0E9B7CC750EEA2C6372A7A96740123385CE50CE"
};

export default example;
