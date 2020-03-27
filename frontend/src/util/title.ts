import { useEffect } from "preact/hooks";

export const useTitle = (url: string) =>
    useEffect(() => {
        const title = getTitle(url);
        if (title) {
            document.title = `${title} | KalkulierbaR`;
        } else {
            document.title = "KalkulierbaR";
        }
    }, [url]);

const getTitle = (url: string) => {
    switch (url.toLowerCase()) {
        case "/":
            return;
        case "/prop-tableaux":
        case "/prop-tableaux/view":
            return "Propositional Tableaux";
        case "/prop-resolution":
        case "/prop-resolution/view":
            return "Propositional Resolution";
        case "/dpll":
        case "/dpll/view":
            return "DPLL";
        case "/fo-tableaux":
        case "/fo-tableaux/view":
            return "First Order Tableaux";
        case "/fo-resolution":
        case "/fo-resolution/view":
            return "First Order Resolution";
        case "/nc-tableaux":
        case "/nc-tableaux/view":
            return "NC Tableaux";
        default:
            return "Not Found";
    }
};
