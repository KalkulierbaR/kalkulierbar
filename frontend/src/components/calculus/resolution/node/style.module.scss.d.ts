import globalClassNames from "../../../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly node: "node";
  readonly nodeNew: "nodeNew";
  readonly nodeDisabled: "nodeDisabled";
  readonly textSelected: "textSelected";
  readonly textClosed: "textClosed";
  readonly noTextHighlight: "noTextHighlight";
  readonly semiSelected: "semiSelected";
};
export = classNames;
