/**
 * Converts an array of strings to a map of indices to strings
 * @param {string[]} array - The array to convert
 * @returns {Map} - the new map
 */
export const stringArrayToStringMap = (
    array: string[],
): Map<number, string> => {
    const map = new Map<number, string>();
    array.forEach((item, index) => map.set(index, item));
    return map;
};
