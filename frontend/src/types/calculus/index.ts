import { DPLLMove } from "./dpll";
import {
    ModalTableauxMove,
    ModalTableauxParams,
    SignedModalTableauxStatistic,
} from "./modal-tableaux";
import { NCTableauxMove } from "./nc-tableaux";
import {
    FOResolutionMove,
    FOResolutionParams,
    PropResolutionMove,
    PropResolutionParams,
} from "./resolution";
import {
    FOSCMove,
    PSCMove,
    SequentCalculusStatistic,
    SequentParams,
} from "./sequent";
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
export type SequentCalculusType = "psc" | "fosc";
export type ModalCalculusType = "signed-modal-tableaux";
export type CalculusType =
    | FOCalculusType
    | PropCalculusType
    | ModalCalculusType;

export enum Calculus {
    propTableaux = "prop-tableaux",
    foTableaux = "fo-tableaux",
    propResolution = "prop-resolution",
    foResolution = "fo-resolution",
    ncTableaux = "nc-tableaux",
    dpll = "dpll",
    psc = "psc",
    fosc = "fosc",
    modalTableaux = "signed-modal-tableaux",
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
    "signed-modal-tableaux": ModalTableauxMove;
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
    psc: SequentParams;
    fosc: SequentParams;
    "signed-modal-tableaux": ModalTableauxParams;
}

export interface StatisticEntry {
    psc: SequentCalculusStatistic;
    fosc: SequentCalculusStatistic;
    "signed-modal-tableaux": SignedModalTableauxStatistic;
}

/**
 * Maps calculi to their respective formula types
 */
export type Formulas = Record<Calculus, string>;
