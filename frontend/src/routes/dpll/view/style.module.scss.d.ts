import globalClassNames from "../../../style.d";
declare const classNames: typeof globalClassNames & {
    readonly tree: "tree";
    readonly list: "list";
    readonly dpllView: "dpllView";
    readonly showTree: "showTree";
};
export = classNames;
