import { DPLLMove, DPLLState } from "./dpll";
import { NCTableauxMove, NCTableauxState } from "./nc-tableaux";
import {
    FOResolutionMove,
    FOResolutionParams,
    FOResolutionState,
    PropResolutionMove,
    PropResolutionParams,
    PropResolutionState,
} from "./resolution";
import {
    FOTableauxMove,
    FOTableauxParams,
    FOTableauxState,
    PropTableauxParams,
    PropTableauxState,
    TableauxMove,
} from "./tableaux";

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
}

export const PropCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.propResolution,
    Calculus.dpll,
];
export const FOCalculus: CalculusType[] = [
    Calculus.foTableaux,
    Calculus.foResolution,
];
export const TableauxCalculus: CalculusType[] = [
    Calculus.propTableaux,
    Calculus.foTableaux,
];
export const ResolutionCalculus: CalculusType[] = [
    Calculus.propResolution,
    Calculus.foResolution,
];

export interface Move {
    "prop-tableaux": TableauxMove;
    "prop-resolution": PropResolutionMove;
    "fo-tableaux": FOTableauxMove;
    "fo-resolution": FOResolutionMove;
    "nc-tableaux": NCTableauxMove;
    dpll: DPLLMove;
}

export interface Params {
    "prop-tableaux": PropTableauxParams;
    "prop-resolution": PropResolutionParams;
    "fo-tableaux": FOTableauxParams;
    "fo-resolution": FOResolutionParams;
    "nc-tableaux": null;
    dpll: null;
}

export type Formulas = Record<Calculus, string>;

export enum Theme {
    dark = "dark",
    light = "light",
    auto = "auto",
}

export interface AppState {
    server: string;
    notification?: Notification;
    smallScreen: boolean;
    theme: Theme;
    savedFormulas: Formulas;
    "prop-tableaux"?: PropTableauxState;
    "prop-resolution"?: PropResolutionState;
    "fo-tableaux"?: FOTableauxState;
    "fo-resolution"?: FOResolutionState;
    "nc-tableaux"?: NCTableauxState;
    dpll?: DPLLState;
    tutorialMode: TutorialMode;
}

export interface DerivedAppState extends AppState {
    onError: (msg: string) => void;
    onSuccess: (msg: string) => void;
    onMessage: (msg: string, type: NotificationType) => void;
    removeNotification: () => void;
    onChange: <C extends CalculusType = CalculusType>(
        calculus: C,
        state: AppState[C],
    ) => void;
    dispatch: (a: AppStateAction) => void;
}

interface AppStateActionBase {
    type: AppStateActionType;
}

export enum AppStateActionType {
    UPDATE_SCREEN_SIZE,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION,
    UPDATE_CALCULUS_STATE,
    SET_THEME,
    SET_SERVER,
    UPDATE_SAVED_FORMULA,
    SET_TUTORIAL_MODE,
}

export interface UpdateScreenSize extends AppStateActionBase {
    type: AppStateActionType.UPDATE_SCREEN_SIZE;
    smallScreen: boolean;
}

export interface AddNotification extends AppStateActionBase {
    type: AppStateActionType.ADD_NOTIFICATION;
    value: Notification;
}

export interface RemoveNotification extends AppStateActionBase {
    type: AppStateActionType.REMOVE_NOTIFICATION;
}

export interface UpdateCalculusState<C extends CalculusType = CalculusType>
    extends AppStateActionBase {
    type: AppStateActionType.UPDATE_CALCULUS_STATE;
    calculus: C;
    value: AppState[C];
}

export interface SetTheme extends AppStateActionBase {
    type: AppStateActionType.SET_THEME;
    value: Theme;
}

export interface SetServer extends AppStateActionBase {
    type: AppStateActionType.SET_SERVER;
    value: string;
}

export interface UpdateSavedFormula<C extends CalculusType = CalculusType>
    extends AppStateActionBase {
    type: AppStateActionType.UPDATE_SAVED_FORMULA;
    calculus: C;
    value: string;
}

export interface SetTutorialMode extends AppStateActionBase {
    type: AppStateActionType.SET_TUTORIAL_MODE;
    value: TutorialMode;
}

export type AppStateAction =
    | UpdateScreenSize
    | AddNotification
    | RemoveNotification
    | UpdateCalculusState
    | SetTheme
    | SetServer
    | UpdateSavedFormula
    | SetTutorialMode;

export type AppStateUpdater = <C extends CalculusType = CalculusType>(
    id: C,
    newState: AppState[C],
) => void;

export enum NotificationType {
    Error,
    Success,
    None,
}

export interface Notification {
    message: string;
    type: NotificationType;
}

export interface CheckCloseResponse {
    closed: boolean;
    msg: string;
}

export interface APIInformation<S> {
    server: string;
    state: S;
    onChange: AppStateUpdater;
    onError: (msg: string) => void;
}

export enum TutorialMode {
    None = 0,
    HighlightFAB = 1,
    HighlightCheck = 2,

    HighlightAll = HighlightCheck | HighlightFAB,
}
