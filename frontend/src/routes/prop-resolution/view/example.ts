import {ResolutionState} from "../../../types/resolution";

const example: ResolutionState = {
    "clauseSet": {
        "clauses": [{
            "atoms": [{"lit": "a", "negated": false}, {
                "lit": "b",
                "negated": true
            }, {"lit": "c", "negated": false}]
        }, {"atoms": [{"lit": "c", "negated": true}, {"lit": "ad", "negated": true}]}, {
            "atoms": [{
                "lit": "d",
                "negated": false
            }, {"lit": "d", "negated": false}]
        }, {"atoms": [{"lit": "b", "negated": true}, {"lit": "a", "negated": false}]}, {
            "atoms": [{
                "lit": "a",
                "negated": false
            }]
        }, {"atoms": [{"lit": "b", "negated": false}, {"lit": "c", "negated": false}]}, {
            "atoms": [{
                "lit": "c",
                "negated": true
            }]
        }]
    },
    "highlightSelectable": false,
    "newestNode": -1,
    "hiddenClauses": {"clauses": []},
    "seal": "6FE068B9D82FCE2630D1EB47109E8D09B34510BE503B57EF375806C66B8823D7"
};

export default example;
