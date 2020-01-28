import {
    ResolutionMove,
    ResolutionParams,
    ResolutionState
} from "./resolution";
import {
    FOTableauxMove,
    FOTableauxParams,
    FOTableauxState,
    PropTableauxParams,
    PropTableauxState,
    TableauxMove
} from "./tableaux";

export type TableauxCalculusType = "prop-tableaux" | "fo-tableaux";
export type CalculusType = TableauxCalculusType | "prop-resolution";

export enum Calculus {
    propTableaux = "prop-tableaux",
    foTableaux = "fo-tableaux",
    propResolution = "prop-resolution",
}
export interface Move {
    "prop-tableaux": TableauxMove;
    "prop-resolution": ResolutionMove;
    "fo-tableaux": FOTableauxMove;
}

export interface Params {
    "prop-tableaux": PropTableauxParams;
    "prop-resolution": ResolutionParams;
    "fo-tableaux": FOTableauxParams;
}

export enum Theme {
    dark = "dark",
    light = "light",
    auto = "auto"
}

export interface AppState {
    server: string;
    notification?: Notification;
    smallScreen: boolean;
    theme: Theme;
    "prop-tableaux"?: PropTableauxState;
    "prop-resolution"?: ResolutionState;
    "fo-tableaux"?: FOTableauxState;
}

export interface DerivedAppState extends AppState {
    onError: (msg: string) => void;
    onSuccess: (msg: string) => void;
    onMessage: (msg: string, type: NotificationType) => void;
    removeNotification: () => void;
    onChange: <C extends CalculusType = CalculusType>(
        calculus: C,
        state: AppState[C]
    ) => void;
    dispatch: (a: AppStateAction) => void;
}

interface AppStateActionBase {
    type: AppStateActionType;
}

export enum AppStateActionType {
    SET_SMALL_SCREEN,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION,
    UPDATE_CALCULUS_STATE,
    SET_THEME,
    SET_SERVER
}

export interface SetSmallScreen extends AppStateActionBase {
    type: AppStateActionType.SET_SMALL_SCREEN;
    value: boolean;
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

export type AppStateAction =
    | SetSmallScreen
    | AddNotification
    | RemoveNotification
    | UpdateCalculusState
    | SetTheme
    | SetServer;

export type AppStateUpdater = <C extends CalculusType = CalculusType>(
    id: C,
    newState: AppState[C]
) => void;

export enum NotificationType {
    Error,
    Success,
    None
}

export interface Notification {
    message: string;
    type: NotificationType;
}

export interface CheckCloseResponse {
    closed: boolean;
    msg: string;
}
