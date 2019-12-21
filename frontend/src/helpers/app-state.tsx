import { createContext, h } from "preact";
import { Reducer, useContext, useReducer } from "preact/hooks";
import {
    AddNotification,
    AppState,
    AppStateAction,
    AppStateActionType,
    Calculus,
    NotificationType,
    RemoveNotification
} from "../types/app";

export const INIT_APP_STATE: AppState = {
    smallScreen: false,
    server: `http://${location.hostname}:7000`
};

const reducer: Reducer<AppState, AppStateAction> = (state, action) => {
    switch (action.type) {
        case AppStateActionType.SET_SMALL_SCREEN:
            return { ...state, smallScreen: action.value };
        case AppStateActionType.ADD_NOTIFICATION:
            return { ...state, notification: action.value };
        case AppStateActionType.REMOVE_NOTIFICATION:
            return { ...state, notification: undefined };
        case AppStateActionType.UPDATE_CALCULUS_STATE:
            return { ...state, [action.calculus]: action.value };
    }
};

export const RemoveNotificationAction: RemoveNotification = {
    type: AppStateActionType.REMOVE_NOTIFICATION
};

export const handleError = (dispatch: (state: AppStateAction) => void) => (
    msg: string
) => dispatch(createErrorNotification(msg));

export const handleSuccess = (dispatch: (state: AppStateAction) => void) => (
    msg: string
) => dispatch(createSuccessNotification(msg));

export const removeNotification = (
    dispatch: (state: AppStateAction) => void
) => () => dispatch(RemoveNotificationAction);

export const createNotification = (
    message: string,
    type: NotificationType
): AddNotification => ({
    type: AppStateActionType.ADD_NOTIFICATION,
    value: { message, type }
});

export const createErrorNotification = (msg: string) =>
    createNotification(msg, NotificationType.Error);

export const createSuccessNotification = (msg: string) =>
    createNotification(msg, NotificationType.Success);

export const updateCalculusState = <C extends Calculus = Calculus>(
    dispatch: (state: AppStateAction) => void
) => (calculus: C, state: AppState[C]) => {
    dispatch({
        type: AppStateActionType.UPDATE_CALCULUS_STATE,
        calculus,
        value: state
    });
};

export type AppContext = [AppState, (action: AppStateAction) => void];

export const AppStateCtx = createContext<AppContext>([
    INIT_APP_STATE,
    () => {}
]);

export const useAppState = () => useContext(AppStateCtx);

export const AppStateProvider = (
    App: preact.FunctionalComponent
): preact.FunctionalComponent => () => (
    <AppStateCtx.Provider
        value={useReducer<AppState, AppStateAction>(reducer, INIT_APP_STATE)}
    >
        <App />
    </AppStateCtx.Provider>
);
