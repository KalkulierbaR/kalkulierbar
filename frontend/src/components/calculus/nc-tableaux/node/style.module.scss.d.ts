import globalClassNames from "../../../../style.d";
declare const classNames: typeof globalClassNames & {
    readonly node: "node";
    readonly textSelected: "textSelected";
    readonly textClosed: "textClosed";
    readonly nodeClosed: "nodeClosed";
    readonly nodeClickable: "nodeClickable";
};
export = classNames;
