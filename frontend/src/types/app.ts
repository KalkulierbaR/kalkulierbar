import { TableauxState } from "./tableaux";

export type Calculus = "prop-tableaux";

/**
 * State of all calculi
 */
export interface AppState {
    server: string;
    notification?: Notification;
    smallScreen: boolean;
    "prop-tableaux"?: TableauxState;
}

interface AppStateActionBase {
    type: AppStateActionType;
}

export enum AppStateActionType {
    SET_SMALL_SCREEN,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION,
    UPDATE_CALCULUS_STATE
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

export interface UpdateCalculusState<C extends Calculus = Calculus>
    extends AppStateActionBase {
    type: AppStateActionType.UPDATE_CALCULUS_STATE;
    calculus: C;
    value: AppState[C];
}

export type AppStateAction =
    | SetSmallScreen
    | AddNotification
    | RemoveNotification
    | UpdateCalculusState;

export type AppStateUpdater = <C extends Calculus = Calculus>(
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
