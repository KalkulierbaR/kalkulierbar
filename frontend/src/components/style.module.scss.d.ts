import globalClassNames from "../style.d";
declare const classNames: typeof globalClassNames & {
    readonly main: "main";
    readonly notifications: "notifications";
};
export = classNames;
