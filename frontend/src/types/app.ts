import { ResolutionState } from "./resolution";
import { TableauxState } from "./tableaux";

/**
 * State of all calculi
 */
export interface AppState {
    "prop-tableaux"?: TableauxState;
    "prop-resolution"?: ResolutionState;
}

export type AppStateUpdater<K extends keyof AppState = keyof AppState> = (
    id: K,
    newState: AppState[K]
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
