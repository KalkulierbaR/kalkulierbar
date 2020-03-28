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

export enum Theme {
    dark = "dark",
    light = "light",
    auto = "auto",
}

/**
 * The state of the application
 */
export interface AppState {
    /**
     * The server we are connected to
     */
    server: string;
    /**
     * The current notification
     */
    notification?: Notification;
    /**
     * Whether the screen is currently small (< 700px width)
     */
    smallScreen: boolean;
    /**
     * The current theme
     */
    theme: Theme;
    /**
     * The currently saved formulas for each calculus
     */
    savedFormulas: Formulas;
    /**
     * The current prop-tableaux state
     */
    "prop-tableaux"?: PropTableauxState;
    /**
     * The current prop-resolution state
     */
    "prop-resolution"?: PropResolutionState;
    /**
     * The current fo-tableaux state
     */
    "fo-tableaux"?: FOTableauxState;
    /**
     * The current fo-resolution state
     */
    "fo-resolution"?: FOResolutionState;
    /**
     * The current nc-tableaux state
     */
    "nc-tableaux"?: NCTableauxState;
    /**
     * The current dpll state
     */
    dpll?: DPLLState;
    /**
     * The current tutorial mode
     */
    tutorialMode: TutorialMode;
}

/**
 * An object that has methods to dispatch notifications
 */
export interface NotificationHandler {
    /**
     * Dispatches a message of type `type`
     */
    message: (type: NotificationType, msg: string) => void;
    /**
     * Dispatches an error message
     */
    error: (msg: string) => void;
    /**
     * Dispatches an success message
     */
    success: (msg: string) => void;
    /**
     * Dispatches an warning message
     */
    warning: (msg: string) => void;
    /**
     * Removes the current message
     */
    remove: () => void;
}

/**
 * The app state expanded by functions to change it
 */
export interface DerivedAppState extends AppState {
    notificationHandler: NotificationHandler;
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
    Warning,
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
    notificationHandler: NotificationHandler;
}

export enum TutorialMode {
    None = 0,
    HighlightFAB = 1,
    HighlightCheck = 1 << 1,

    HighlightAll = HighlightCheck | HighlightFAB,
}
