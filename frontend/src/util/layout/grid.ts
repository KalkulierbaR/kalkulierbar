import { Clause, FOLiteral } from "../../types/clause";
import { ArrayLayout, LayoutItem } from "../../types/layout";
import { maxBy } from "../max-by";
import { estimateSVGTextWidth } from "../text-width";
import { clauseToString } from "../clause";

export const gridLayout = (
    clauses: Array<Clause<string | FOLiteral>>,
): ArrayLayout<Clause<string | FOLiteral>> => {
    if (clauses.length === 0) return { width: 0, height: 0, data: [] };

    // Guess clause width by the length of the longest string
    const width =
        maxBy(clauses, (c) => estimateSVGTextWidth(clauseToString(c))) + 56;

    // The height is constant. The value here has no special meaning
    let height = 35;

    const columns = 5;
    let rows = 0;

    const padding = 16;

    const data: LayoutItem<Clause<string | FOLiteral>>[] = [];

    for (let i = 0; i < clauses.length; i++) {
        if (i % columns === 0) {
            rows++;
        }

        data.push({
            x: (i % columns) * width + width / 2,
            y: (rows - 1) * (height + padding),
            data: clauses[i],
        });
    }

    return { height: rows * (height + padding), width: columns * width, data };
};
