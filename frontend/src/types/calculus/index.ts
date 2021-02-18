import { DPLLMove } from "./dpll";
import { NCTableauxMove } from "./nc-tableaux";
import { FOSCMove, PSCMove, PSCParams } from "./psc";
import {
    FOResolutionMove,
    FOResolutionParams,
    PropResolutionMove,
    PropResolutionParams,
} from "./resolution";
import {
    FOTableauxMove,
    FOTableauxParams,
    PropTableauxParams,
    TableauxMove,
} from "./tableaux";

export type TableauxCalculusType = "prop-tableaux" | "fo-tableaux";
export type ResolutionCalculusType = "prop-resolution" | "fo-resolution";
export type PSCCalculusType = "psc" | "fosc";
export type PropCalculusType =
    | "prop-tableaux"
    | "prop-resolution"
    | "dpll"
    | "psc";
export type FOCalculusType =
    | "fo-tableaux"
    | "fo-resolution"
    | "nc-tableaux"
    | "fosc";
export type CalculusType = FOCalculusType | PropCalculusType;

export enum Calculus {
    propTableaux = "prop-tableaux",
    foTableaux = "fo-tableaux",
    propResolution = "prop-resolution",
    foResolution = "fo-resolution",
    ncTableaux = "nc-tableaux",
    dpll = "dpll",
    psc = "psc",
    fosc = "fosc",
}

export const PropCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.propResolution,
    Calculus.dpll,
    Calculus.psc,
];
export const FOCalculus: CalculusType[] = [
    Calculus.foTableaux,
    Calculus.foResolution,
    Calculus.ncTableaux,
    Calculus.fosc,
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
    psc: PSCMove;
    fosc: FOSCMove;
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
    psc: PSCParams;
    fosc: PSCParams;
}

/**
 * Maps calculi to their respective formula types
 */
export type Formulas = Record<Calculus, string>;
