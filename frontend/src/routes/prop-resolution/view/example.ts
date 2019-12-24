import { ResolutionState } from "../../../types/resolution";

const example: ResolutionState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: true },
                    { lit: "c", negated: false }
                ]
            },
            { atoms: [{ lit: "a", negated: false }] },
            { atoms: [{ lit: "c", negated: true }] }
        ]
    },
    seal: ""
};

export default example;
