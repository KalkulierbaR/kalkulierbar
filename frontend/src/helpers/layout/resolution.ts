import { Clause } from "../../types/clause";
import { LayoutData } from "../../types/layout";
import { clauseToString } from "../clause";

const maxLengthClause = (clauses: readonly Clause[]) =>
    clauses.reduce(
        (prev, clause) => Math.max(prev, clauseToString(clause).length),
        0
    );

export const circleLayout = (
    clauses: readonly Clause[]
): [number, number, Array<LayoutData<Clause>>] => {
    if (clauses.length === 0) {
        return [0, 0, []];
    }

    const width = maxLengthClause(clauses) * 5;

    // Special case: 1 clause
    if (clauses.length === 1) {
        return [width, 50, [{ data: clauses[0], x: 0, y: 0 }]];
    }

    const angle = (Math.PI * 2) / clauses.length;

    const height = 20;

    const r = Math.max(
        height / Math.sin(angle),
        (width * Math.tan((Math.PI - angle) / 2)) / Math.sin(angle)
    );

    return [
        2 * r + width,
        2.2 * r + height,
        clauses.map((c, i) => ({
            data: c,
            x: r * Math.sin(angle * i),
            y: r * Math.cos(angle * i)
        }))
    ];
};
