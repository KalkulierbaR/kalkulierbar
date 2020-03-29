/**
 * Normalizes the value so that it is definitely in the range of [min,max]
 * @param {number} value - The value to normalize
 * @param {number} min - The minimal value to allow. If `value` is smaller than `min`, the result will be `min`
 * @param {number} max - The maximal value to allow. If `value` is larger than `min`, the result will be `max`
 * @returns {number} - The normalized value
 */
export const normalize = (
    value: number,
    min: number = 0,
    max: number = Infinity,
) => {
    return Math.max(min, Math.min(max, value));
};
