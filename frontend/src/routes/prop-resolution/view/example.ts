import {ResolutionState} from "../../../types/resolution";

const example: ResolutionState = {
    clauseSet: {
        "clauses": [{
            "atoms": [{"lit": "a", "negated": false}, {"lit": "b", "negated": true}, {
                "lit": "c",
                "negated": false
            }]
        }, {
            "atoms": [{"lit": "c", "negated": true}, {"lit": "a", "negated": true}, {
                "lit": "d",
                "negated": false
            }]
        }, {"atoms": [{"lit": "d", "negated": false}, {"lit": "c", "negated": false}]}, {
            "atoms": [{
                "lit": "b",
                "negated": true
            }, {"lit": "a", "negated": false}]
        }, {"atoms": [{"lit": "a", "negated": true}]}, {
            "atoms": [{"lit": "b", "negated": false}, {
                "lit": "c",
                "negated": false
            }]
        }, {"atoms": [{"lit": "c", "negated": true}]}]
    }, "seal": "E1018A62BF9682AEC7ACCCC21D00CF0D646D20DDBCEE446E3688A829FD0162CF"
};

export default example;
