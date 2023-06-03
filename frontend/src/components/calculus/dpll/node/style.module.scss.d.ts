import globalClassNames from "../../../../style.d";
declare const classNames: typeof globalClassNames & {
    readonly node: "node";
    readonly nodeAnnotated: "nodeAnnotated";
    readonly nodeAnnotatedSelected: "nodeAnnotatedSelected";
    readonly text: "text";
    readonly textSelected: "textSelected";
};
export = classNames;
