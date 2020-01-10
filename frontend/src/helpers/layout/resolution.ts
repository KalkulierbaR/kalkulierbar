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

    const width = maxLengthClause(clauses) * 5;

    // Special case: 1 clause
    if (clauses.length === 1) {
        return { width, height: 50, data: [{ data: clauses[0], x: 0, y: 0 }] };
    }

    const angle = (Math.PI * 2) / clauses.length;

    const height = 20;

    const r = Math.max(
        height / Math.sin(angle),
        (width * Math.tan((Math.PI - angle) / 2)) / Math.sin(angle)
    );

    return {
        width: 2 * r + width,
        height: 2.2 * r + height,
        data: clauses.map((c, i) => ({
            data: c,
            x: r * Math.sin(angle * i),
            y: r * Math.cos(angle * i)
        }))
    };
};
