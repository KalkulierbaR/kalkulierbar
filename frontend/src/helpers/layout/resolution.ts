import { Clause } from "../../types/clause";
import { LayoutData } from "../../types/layout";
import { clauseToString } from "../clause";

/**
 * Determine the longest clause
 * @param {Clause[]} clauses - The clauses
 * @returns {Clause} - The longest clause
 */
const maxLengthClause = (clauses: readonly Clause[]) =>
    clauses.reduce(
        (prev, clause) => Math.max(prev, clauseToString(clause).length),
        0
    );

export interface CircleLayoutData {
    /**
     * The width of the circle
     */
    width: number;
    /**
     * The height of the circle
     */
    height: number;
    /**
     * The array of clauses with their coordinates
     */
    data: Array<LayoutData<Clause>>;
}

/**
 * Calculate the circle layout to avoid overlapping or cutting of clauses
 * @param {Clause[]} clauses - The clauses to display in a circle
 * @param {boolean} debug - Whether to log debug info
 * @returns {CircleLayoutData} - The circle layout of the clauses
 */
export const circleLayout = (
    clauses: readonly Clause[],
    debug: boolean = true
): CircleLayoutData => {
    if (clauses.length === 0) {
        return { width: 0, height: 0, data: [] };
    }

    // Guess clause width by the length of the longest string
    const width = maxLengthClause(clauses) * 11;

    // Special case: 1 clause
    if (clauses.length === 1) {
        return { width, height: 50, data: [{ data: clauses[0], x: 0, y: 0 }] };
    }

    // The angle between each clause
    const angle = (Math.PI * 2) / clauses.length;

    // The height is constant. The value here has no special meaning
    let height = 35;

    let r: number;

    if (clauses.length === 2) {
        height *= 4;
        r = height;
    } else {
        // Calculate the radius the circle must have to ensure no overlaps in either height or width
        r =
            1.2 *
            Math.max(
                height / Math.sin(angle),
                width / Math.sin(angle)
                // (width * Math.tan((Math.PI - angle) / 2)) / Math.sin(angle)
            );
        if (debug) {
            console.log(r === height / Math.sin(angle) ? "height" : "width");
        }
    }

    return {
        // The width of the svg element must be at least the diameter + padding
        width: 2.2 * r + width,
        // Give a little extra height to give padding
        height: 2.2 * r + height,
        // Transform polar coordinates to cartesian coordinates
        data: clauses.map((c, i) => ({
            data: c,
            x: r * Math.cos(angle * i - Math.PI / 2),
            y: r * Math.sin(angle * i - Math.PI / 2) + 14
        }))
    };
};
