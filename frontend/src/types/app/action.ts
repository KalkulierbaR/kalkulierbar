import {CalculusType} from "../calculus";

import {AppState} from "./app-state";
import {Config} from "./config";
import {Notification} from "./notification";
import {Theme} from "./theme";
import {TutorialMode} from "./tutorial";

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
    SET_CONFIG,
    SET_ADMIN_KEY,
    SET_ADMIN,
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

export interface SetConfig extends AppStateActionBase {
    type: AppStateActionType.SET_CONFIG;
    value: Config;
}

export interface SetAdminKey extends AppStateActionBase {
    type: AppStateActionType.SET_ADMIN_KEY;
    value: string;
}
export interface SetAdmin extends AppStateActionBase {
    type: AppStateActionType.SET_ADMIN;
    value: boolean;
}

export type AppStateAction =
    | UpdateScreenSize
    | AddNotification
    | RemoveNotification
    | UpdateCalculusState
    | SetTheme
    | SetServer
    | UpdateSavedFormula
    | SetTutorialMode
    | SetConfig
    | SetAdminKey
    | SetAdmin;
