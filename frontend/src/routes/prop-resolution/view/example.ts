import { ResolutionState } from "../../../types/resolution";

const example: ResolutionState = {
    clauseSet: {
        clauses: [
            {
                atoms: [
                    { lit: "a", negated: true },
                    { lit: "b", negated: false },
                    { lit: "c", negated: false },
                ]
            },
            {
                atoms: [
                    { lit: "a", negated: false },
                    { lit: "b", negated: false },
                ]
            },
            {
                atoms: [
                    { lit: "c", negated: true },
                ]
            },
            {
                atoms: [
                    { lit: "b", negated: true },
                ]
            },
        ]
    },
    seal: "D4D554F14F29134FF70CBE70F1752AEF7A66AC0CA8382839736E14A5E47152A5"
};

export default example;
