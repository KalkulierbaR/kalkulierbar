/**
 * Gets the maximum of an array that is mapped by a function
 * @param {T[]} list - the list to find the max in
 * @param {Function} f - the converter function
 * @returns {number} - the maximum value
 */
export const maxBy = <T>(list: readonly T[], f: (d: T) => number): number =>
    list.reduce((prev, d) => Math.max(prev, f(d)), 0);
