export const stringArrayToStringMap = (array: string[]) => {
    const map = new Map<number, string>();
    array.forEach((item, index) => map.set(index, item));
    return map;
};
