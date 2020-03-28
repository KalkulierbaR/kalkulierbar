import { AppStateUpdater } from "./app-state";
import { NotificationHandler } from "./notification";

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
