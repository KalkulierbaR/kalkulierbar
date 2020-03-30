import { Clause, FOLiteral } from "../../types/clause";
import { ArrayLayout, LayoutItem } from "../../types/layout";
import { clauseToString } from "../clause";
import { maxBy } from "../max-by";
import { estimateSVGTextWidth } from "../text-width";

const HEIGHT_PADDING = 16;
const WIDTH_PADDING = 32;

/**
 * Calculate the grid layout
 * @param {Clause[]} clauses - The clauses to display in a grid
 * @returns {ArrayLayout<Clause>} - The grid layout of the clauses
 */
export const gridLayout = (
    clauses: Clause<string | FOLiteral>[],
): ArrayLayout<Clause<string | FOLiteral>> & {
    rows: number;
    columns: number;
    rowHeight: number;
    columnWidth: number;
} => {
    if (clauses.length === 0) {
        return {
            width: 0,
            height: 0,
            data: [],
            rows: 0,
            columns: 0,
            rowHeight: 0,
            columnWidth: 0,
        };
    }

    // Guess clause width by the length of the longest string
    const width =
        maxBy(clauses, (c) => estimateSVGTextWidth(clauseToString(c))) * 1.5 +
        WIDTH_PADDING;

    // The height is constant. The value here has no special meaning
    const height = 35 + HEIGHT_PADDING;

    // Calculate the optimal column number to match the window aspect ratio
    const columns = findOptimalColumnNumber(width, height, clauses.length);

    let rows = 0;

    const data: LayoutItem<Clause<string | FOLiteral>>[] = [];

    for (let i = 0; i < clauses.length; i++) {
        if (i % columns === 0) {
            rows++;
        }

        data.push({
            x: (i % columns) * width + width / 2,
            y: (rows - 1) * height + height / 2 + HEIGHT_PADDING / 2,
            data: clauses[i],
        });
    }

    return {
        height: rows * height,
        width: columns * width,
        data,
        rows,
        columns,
        rowHeight: height,
        columnWidth: width,
    };
};

/**
 * Calculates the number of columns for which the grid is closest to the ratio of the window
 * @param {number} cWidth - Max width of a clause
 * @param {number} cHeight - Height of a clause
 * @param {number} length - Number of clauses
 * @returns {number} - The optimal number of columns
 */
const findOptimalColumnNumber = (
    cWidth: number,
    cHeight: number,
    length: number,
) => {
    const windowRatio = window.innerWidth / window.innerHeight;
    const c = Math.sqrt((length * windowRatio * cHeight) / cWidth);

    return Math.round(c);
};
