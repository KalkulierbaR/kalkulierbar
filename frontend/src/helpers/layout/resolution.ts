import { Clause } from "../../types/clause";
import { LayoutData } from "../../types/layout";
import { clauseToString } from "../clause";

const maxLengthClause = (clauses: readonly Clause[]) =>
    clauses.reduce(
        (prev, clause) => Math.max(prev, clauseToString(clause).length),
        0
    );

export interface CircleLayoutData {
    width: number;
    height: number;
    data: Array<LayoutData<Clause>>;
}

export const circleLayout = (clauses: readonly Clause[]): CircleLayoutData => {
    if (clauses.length === 0) {
        return { width: 0, height: 0, data: [] };
    }

    // Guess clause width by the length of the longest string
    const width = maxLengthClause(clauses) * 5;

    // Special case: 1 clause
    if (clauses.length === 1) {
        return { width, height: 50, data: [{ data: clauses[0], x: 0, y: 0 }] };
    }

    // The angle between each clause
    const angle = (Math.PI * 2) / clauses.length;

    // The height is constant. The value here has no special meaning
    const height = 20;

    // Calculate the radius the circle must have to ensure no overlaps in either height or width
    const r = Math.max(
        height / Math.sin(angle),
        (width * Math.tan((Math.PI - angle) / 2)) / Math.sin(angle)
    );

    return {
        // The width of the svg element must be at least the diameter + padding
        width: 2.2 * r + width,
        // Give a little extra height to give padding
        height: 2.2 * r + height,
        // Transform polar coordinates to cartesian coordinates
        data: clauses.map((c, i) => ({
            data: c,
            x: r * Math.sin(angle * i),
            y: r * Math.cos(angle * i)
        }))
    };
};
