export const maxBy = <T>(list: readonly T[], f: (d: T) => number) =>
    list.reduce((prev, d) => Math.max(prev, f(d)), 0);
