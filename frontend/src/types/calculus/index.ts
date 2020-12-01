import {
    TableauxMove,
    FOTableauxMove,
    PropTableauxParams,
    FOTableauxParams,
} from "./tableaux";
import {
    PropResolutionMove,
    FOResolutionMove,
    PropResolutionParams,
    FOResolutionParams,
} from "./resolution";
import { NCTableauxMove } from "./nc-tableaux";
import { DPLLMove } from "./dpll";

export type TableauxCalculusType = "prop-tableaux" | "fo-tableaux";
export type ResolutionCalculusType = "prop-resolution" | "fo-resolution";
export type PropCalculusType = "prop-tableaux" | "prop-resolution" | "dpll";
export type FOCalculusType = "fo-tableaux" | "fo-resolution" | "nc-tableaux";
export type CalculusType = FOCalculusType | PropCalculusType;

export enum Calculus {
    propTableaux = "prop-tableaux",
    foTableaux = "fo-tableaux",
    propResolution = "prop-resolution",
    foResolution = "fo-resolution",
    ncTableaux = "nc-tableaux",
    dpll = "dpll",
    myHipCalculus = "my-hip-calculus"
}

export const PropCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.propResolution,
    Calculus.dpll,
];
export const FOCalculus: CalculusType[] = [
    Calculus.foTableaux,
    Calculus.foResolution,
    Calculus.ncTableaux,
];
export const TableauxCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.foTableaux,
];
export const ResolutionCalculus: CalculusType[] = [
    Calculus.propResolution,
    Calculus.foResolution,
];

/**
 * Maps calculi to their respective moves
 */
export interface Move {
    "prop-tableaux": TableauxMove;
    "prop-resolution": PropResolutionMove;
    "fo-tableaux": FOTableauxMove;
    "fo-resolution": FOResolutionMove;
    "nc-tableaux": NCTableauxMove;
    dpll: DPLLMove;
}

/**
 * Maps calculi to their respective params
 */
export interface Params {
    "prop-tableaux": PropTableauxParams;
    "prop-resolution": PropResolutionParams;
    "fo-tableaux": FOTableauxParams;
    "fo-resolution": FOResolutionParams;
    "nc-tableaux": null;
    dpll: null;
}

/**
 * Maps calculi to their respective formula types
 */
export type Formulas = Record<Calculus, string>;
