/* tslint:disable */
declare namespace JSX {
    type Element = preact.JSX.Element;
    type HTMLAttributes = preact.JSX.HTMLAttributes;
}

declare module "async!*" {
    const component: preact.FunctionalComponent<any>;
    export default component;
}

declare module "async!../routes/tableaux*" {
    const component: preact.FunctionalComponent<{
        calculus: "prop-tableaux" | "fo-tableaux";
    }>;
    export default component;
}

declare module "async!../routes/resolution*" {
    const component: preact.FunctionalComponent<{
        calculus: "prop-resolution" | "fo-resolution";
    }>;
    export default component;
}
