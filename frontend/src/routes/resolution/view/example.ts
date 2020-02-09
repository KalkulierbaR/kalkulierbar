import { ResolutionState } from "../../../types/resolution";

const example: ResolutionState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: false },
                    { lit: "b", negated: true },
                    { lit: "c", negated: false }
                ]
            },
            {
                atoms: [
                    { lit: "c", negated: true },
                    { lit: "ad", negated: true }
                ]
            },
            {
                atoms: [
                    { lit: "d", negated: false },
                    { lit: "d", negated: false }
                ]
            },
            {
                atoms: [
                    { lit: "b", negated: true },
                    { lit: "a", negated: false }
                ]
            },
            { atoms: [{ lit: "a", negated: true }] },
            {
                atoms: [
                    { lit: "b", negated: false },
                    { lit: "c", negated: false }
                ]
            },
            { atoms: [{ lit: "c", negated: true }] }
        ]
    },
    highlightSelectable: true,
    newestNode: -1,
    seal: "CE5D43AB2B2794CF8B842BF036E07231576A205B5E7B2E373F7723C209F0C107"
};

export default example;
