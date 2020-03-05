import { DPLLNodeType, DPLLState } from "../../../types/dpll";

const dpllExampleState: DPLLState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: false },
                    { lit: "b", negated: false },
                    { lit: "c", negated: false },
                ],
            },
            {
                atoms: [
                    { lit: "c", negated: true },
                    { lit: "a", negated: false },
                    { lit: "a", negated: false },
                    { lit: "d", negated: true },
                ],
            },
            {
                atoms: [
                    { lit: "d", negated: false },
                    { lit: "d", negated: false },
                ],
            },
            {
                atoms: [
                    { lit: "b", negated: true },
                    { lit: "a", negated: false },
                ],
            },
            { atoms: [{ lit: "a", negated: true }] },
            { atoms: [{ lit: "c", negated: false }] },
            { atoms: [{ lit: "b", negated: false }] },
        ],
    },
    tree: [
        {
            parent: null,
            type: DPLLNodeType.ROOT,
            label: "true",
            diff: { type: "cd-identity" },
            children: [],
            modelVerified: null,
        },
    ],
    seal: "70F81595C4A189A065373ED51597E24EE07C5022C12DAFD81A3EDBB72495F6E0",
};

export default dpllExampleState;
