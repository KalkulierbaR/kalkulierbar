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
                    { lit: "a", negated: true },
                    { lit: "d", negated: false }
                ]
            },
            {
                atoms: [
                    { lit: "d", negated: false },
                    { lit: "c", negated: false }
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
    seal: "1B1EA116706E73E55AE0B2CADA263D48086737C38D33E05CD760ED5852A0085C"
};

export default example;
