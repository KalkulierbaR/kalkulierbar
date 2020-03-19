import { createContext, h } from "preact";
import { Reducer, useContext, useEffect, useReducer } from "preact/hooks";
import {
    AddNotification,
    AppState,
    AppStateAction,
    AppStateActionType,
    Calculus,
    CalculusType,
    DerivedAppState,
    NotificationType,
    RemoveNotification,
    Theme,
    TutorialMode,
    Config,
} from "../types/app";
import { localStorageGet, localStorageSet } from "./local-storage";

const isDeployed = location.port !== "8080";

const INIT_APP_STATE: AppState = {
    smallScreen: false,
    savedFormulas: {
        [Calculus.propResolution]: "",
        [Calculus.foResolution]: "",
        [Calculus.propTableaux]: "",
        [Calculus.foTableaux]: "",
        [Calculus.dpll]: "",
    },
    server: isDeployed
        ? "https://kalkulierbar-api.herokuapp.com"
        : `http://${location.hostname}:7000`,
    theme: Theme.auto,
    tutorialMode: TutorialMode.HighlightAll,
    isAdmin: true, //TODO: false
    adminKey: "test",
    config: {
        disabled: ["prop-tableaux"],
        examples: [],
    },
};

const reducer: Reducer<AppState, AppStateAction> = (
    state,
    action,
): AppState => {
    switch (action.type) {
        case AppStateActionType.UPDATE_SCREEN_SIZE:
            return {
                ...state,
                smallScreen: action.smallScreen,
            };
        case AppStateActionType.ADD_NOTIFICATION:
            return { ...state, notification: action.value };
        case AppStateActionType.REMOVE_NOTIFICATION:
            return { ...state, notification: undefined };
        case AppStateActionType.UPDATE_CALCULUS_STATE:
            return {
                ...state,
                [action.calculus]: action.value,
                notification: undefined,
            };
        case AppStateActionType.SET_THEME:
            return { ...state, theme: action.value };
        case AppStateActionType.SET_SERVER:
            return { ...state, server: action.value, notification: undefined };
        case AppStateActionType.UPDATE_SAVED_FORMULA:
            return {
                ...state,
                savedFormulas: {
                    ...state.savedFormulas,
                    [action.calculus]: action.value,
                },
            };
        case AppStateActionType.SET_TUTORIAL_MODE:
            return { ...state, tutorialMode: action.value };
        case AppStateActionType.SET_CONFIG:
            return { ...state, config: action.value };
        case AppStateActionType.SET_ADMIN_KEY:
            return { ...state, adminKey: action.value };
        case AppStateActionType.SET_ADMIN:
            return { ...state, isAdmin: action.value };
    }
};

export const RemoveNotificationAction: RemoveNotification = {
    type: AppStateActionType.REMOVE_NOTIFICATION,
};

export const createNotification = (
    message: string,
    type: NotificationType,
): AddNotification => ({
    type: AppStateActionType.ADD_NOTIFICATION,
    value: { message, type },
});

export const createErrorNotification = (msg: string) =>
    createNotification(msg, NotificationType.Error);

export const createSuccessNotification = (msg: string) =>
    createNotification(msg, NotificationType.Success);

export const updateCalculusState = <C extends CalculusType = CalculusType>(
    dispatch: (state: AppStateAction) => void,
) => (calculus: C, state: AppState[C]) => {
    dispatch({
        type: AppStateActionType.UPDATE_CALCULUS_STATE,
        calculus,
        value: state,
    });
};

const derive = (
    state: AppState,
    dispatch: (a: AppStateAction) => void,
): DerivedAppState => ({
    ...state,
    onError: (msg: string) => dispatch(createErrorNotification(msg)),
    onSuccess: (msg: string) => dispatch(createSuccessNotification(msg)),
    onMessage: (msg: string, type: NotificationType) =>
        dispatch(createNotification(msg, type)),
    removeNotification: () => dispatch(RemoveNotificationAction),
    onChange: updateCalculusState(dispatch),
    setConfig: (cfg: Config) =>
        dispatch({ type: AppStateActionType.SET_CONFIG, value: cfg }),
    dispatch,
});

export const AppStateCtx = createContext<DerivedAppState>(
    derive(INIT_APP_STATE, () => {}),
);

export const useAppState = () => useContext(AppStateCtx);

export const AppStateProvider = (
    App: preact.FunctionalComponent,
): preact.FunctionalComponent => () => {
    const storedTheme = localStorageGet<Theme>("theme");
    const storedServer = localStorageGet<string>("server");
    const tutorialMode =
        localStorageGet<TutorialMode>("tutorial_mode") ??
        TutorialMode.HighlightAll;
    const adminKey = localStorageGet<string>("admin_key");

    INIT_APP_STATE.theme = storedTheme || INIT_APP_STATE.theme;
    INIT_APP_STATE.server = storedServer || INIT_APP_STATE.server;
    INIT_APP_STATE.tutorialMode = tutorialMode;
    INIT_APP_STATE.adminKey = adminKey || INIT_APP_STATE.adminKey;

    const [state, dispatch] = useReducer<AppState, AppStateAction>(
        reducer,
        INIT_APP_STATE,
    );
    const derived = derive(state, dispatch);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", derived.theme);
        localStorageSet("theme", derived.theme);
    }, [derived.theme]);
    useEffect(() => {
        localStorageSet("server", derived.server);
    }, [derived.server]);
    useEffect(() => {
        localStorageSet("tutorial_mode", derived.tutorialMode);
    }, [derived.tutorialMode]);
    useEffect(() => {
        localStorageSet("admin_key", derived.adminKey);
    }, [derived.adminKey]);

    return (
        <AppStateCtx.Provider value={derived}>
            <App />
        </AppStateCtx.Provider>
    );
};
