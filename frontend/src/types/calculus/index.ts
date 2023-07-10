import { DPLLMove } from "./dpll";
import { ModalTableauxMove, ModalTableauxParams } from "./modal-tableaux";
import { NCTableauxMove } from "./nc-tableaux";
import {
    FOResolutionMove,
    FOResolutionParams,
    PropResolutionMove,
    PropResolutionParams,
} from "./resolution";
import { FOSequentMove, PropSequentMove, SequentParams } from "./sequent";
import {
    FOTableauxMove,
    FOTableauxParams,
    PropTableauxParams,
    TableauxMove,
} from "./tableaux";

export type TableauxCalculusType = "prop-tableaux" | "fo-tableaux";
export type ResolutionCalculusType = "prop-resolution" | "fo-resolution";
export type SequentCalculusType = "prop-sequent" | "fo-sequent";
export type PropCalculusType =
    | "prop-tableaux"
    | "prop-resolution"
    | "dpll"
    | "prop-sequent";
export type FOCalculusType =
    | "fo-tableaux"
    | "fo-resolution"
    | "nc-tableaux"
    | "fo-sequent";
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
    propSequent = "prop-sequent",
    foSequent = "fo-sequent",
    modalTableaux = "signed-modal-tableaux",
}

export const PropCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.propResolution,
    Calculus.dpll,
    Calculus.propSequent,
];
export const FOCalculus: CalculusType[] = [
    Calculus.foTableaux,
    Calculus.foResolution,
    Calculus.ncTableaux,
    Calculus.foSequent,
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
    "prop-sequent": PropSequentMove;
    "fo-sequent": FOSequentMove;
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
    "prop-sequent": SequentParams;
    "fo-sequent": SequentParams;
    "signed-modal-tableaux": ModalTableauxParams;
}

/**
 * Maps calculi to their respective formula types
 */
export type Formulas = Record<Calculus, string>;
