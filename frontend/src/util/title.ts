import { useEffect } from "preact/hooks";

/**
 * Hook to update the title
 * @param {string} url - current URL
 * @returns {void} - void
 */
export const useTitle = (url: string) =>
    useEffect(() => {
        const title = getTitle(url);
        if (title) {
            document.title = `${title} | KalkulierbaR`;
        } else {
            document.title = "KalkulierbaR";
        }
    }, [url]);

/**
 * Gets the title for the current URL
 * @param {string} url - the current URL
 * @returns {string} - title
 */
const getTitle = (url: string) => {
    switch (url.toLowerCase()) {
        case "":
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
        case "/psc":
        case "/psc/view":
            return "Propositional Sequent";
        case "/fosc":
        case "/fosc/view":
            return "First Order Sequent";
        default:
            return "Not Found";
    }
};
