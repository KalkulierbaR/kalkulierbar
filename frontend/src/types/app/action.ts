import { CalculusType } from "../calculus";
import { AppState } from "./app-state";
import { Theme } from "./theme";
import { TutorialMode } from "./tutorial";
import { Notification } from "./notification";

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
