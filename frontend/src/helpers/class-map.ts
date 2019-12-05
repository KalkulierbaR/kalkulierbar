export interface ClassInfo {
    readonly [name: string]: string | boolean | number;
}

export const classMap = (ci: ClassInfo) => {
    let list = "";
    for (const c in ci) {
        if (ci[c]) {
            list += ` ${c}`;
        }
    }
    return list;
};
