export interface ClassInfo {
    readonly [name: string]: string | boolean | number;
}

/**
 * Creates a string for HTML `class` attributes out of the object.
 * Every key gets treated as a class name. Iff the corresponding value is truthy, add the class.
 * @param {ClassInfo} ci - the class info object.
 * @returns {string} - the class string.
 */
export const classMap = (ci: ClassInfo) => {
    let list = "";
    for (const c in ci) {
        if (ci[c]) {
            list += ` ${c}`;
        }
    }
    return list;
};
