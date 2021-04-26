import {Calculus} from "../../../types/calculus";

export interface SingleLink {
    /**
     * The name for the link
     */
    name: string;
    /**
     * The path to which it links
     */
    path: string;
}

export interface LinkGroup {
    /**
     * The name for the link group
     */
    name: string;
    /**
     * The routes of this group
     */
    routes: SingleLink[];
}

export const ROUTES: LinkGroup[] = [
    {
        name: "Propositional",
        routes: [
            {
                name: "Tableaux",
                path: Calculus.propTableaux,
            },
            { name: "Resolution", path: Calculus.propResolution },
            { name: "DPLL", path: Calculus.dpll },
            { name: "Sequent", path: Calculus.propSequent },
        ],
    },
    {
        name: "First Order",
        routes: [
            {
                name: "Tableaux",
                path: Calculus.foTableaux,
            },
            { name: "Resolution", path: Calculus.foResolution },
            { name: "NC Tableaux", path: Calculus.ncTableaux },
            { name: "Sequent", path: Calculus.foSequent },
        ],
    },
    {
        name: "Modal",
        routes: [
            {
                name: "Tableaux",
                path: Calculus.modalTableaux,
            },
        ],
    },
];
