import globalClassNames from "../../style.d";
declare const classNames: typeof globalClassNames & {
    readonly snack: "snack";
    readonly error: "error";
    readonly success: "success";
    readonly warn: "warn";
    readonly none: "none";
    readonly btn: "btn";
};
export = classNames;
