import globalClassNames from "../../../style.d";
declare const classNames: typeof globalClassNames & {
  readonly example: "example";
  readonly description: "description";
  readonly params: "params";
};
export = classNames;
