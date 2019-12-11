import { createContext, h } from "preact";
import { Router } from "preact-router";
import { useEffect, useState } from "preact/hooks";

import { checkClose as checkCloseHelper, checkCloseFn } from "../helpers/api";
import Home from "../routes/home";
import Tableaux from "../routes/prop-tableaux";
import TableauxView from "../routes/prop-tableaux/view";
import { AppState, Notification, NotificationType } from "../types/app";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.css";

const SERVER = "http://127.0.0.1:7000";

// Create our contexts.
export const SmallScreen = createContext<boolean>(false);
export const CheckClose = createContext<checkCloseFn | undefined>(undefined);

const SMALL_SCREEN_THRESHOLD = 700;

/**
 * Check if server is online
 * @param {string} url - The url to send a request to
 * @param {Function} onError - Error handler
 * @returns {Promise} - Promise that resolves when check is done
 */
async function checkServer(url: string, onError: (msg: string) => void) {
    try {
        await fetch(url);
    } catch (e) {
        onError(`Server ${url} appears to be offline`);
    }
}

/**
 * Updates the setter with the new small screen info
 * @param {Function} setter - the function to call with the new value.
 * @returns {void} - nothing. JSDoc is dumb.
 */
const updateSmallScreen = (setter: (s: boolean) => void) => {
    const width = window.innerWidth;
    const small = width < SMALL_SCREEN_THRESHOLD;
    setter(small);
};

// Used for debugging with Yarn
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

// This is the main App component which handles routing and calls other components
const App: preact.FunctionalComponent = () => {
    const [state, setState] = useState<AppState>({});
    const [notification, setNotification] = useState<Notification | undefined>(
        undefined
    );
    const [smallScreen, setSmallScreen] = useState<boolean>(false);

    const removeNotification = () => {
        setNotification(undefined);
    };

    const handleError = (msg: string) =>
        setNotification({ type: NotificationType.Error, message: msg });

    const handleSuccess = (msg: string) =>
        setNotification({ type: NotificationType.Success, message: msg });

    const handleMessage = (
        msg: string,
        type: NotificationType = NotificationType.None
    ) => setNotification({ type, message: msg });

    useEffect(() => {
        checkServer(SERVER, handleError);
        updateSmallScreen(setSmallScreen);
        window.addEventListener("resize", () =>
            updateSmallScreen(setSmallScreen)
        );
    }, []);

    /**
     * Updates the state of the given calculus
     * @param {string} id  - the id of the calculus
     * @param {any} newState  - new state of the calculus
     * @returns {void}
     */
    function onChange<K extends keyof AppState>(id: K, newState: AppState[K]) {
        setState(s => ({ ...s, [id]: newState }));
    }

    const checkClose = checkCloseHelper(SERVER, handleError, handleSuccess);

    return (
        <div id="app">
            <SmallScreen.Provider value={smallScreen}>
                <CheckClose.Provider value={checkClose}>
                    <Header />
                    <main class={style.main}>
                        <Router>
                            <Home path="/" />

                            <Tableaux
                                path="/prop-tableaux"
                                server={SERVER}
                                onChange={onChange}
                                onError={handleError}
                            />
                            <TableauxView
                                path="/prop-tableaux/view"
                                server={SERVER}
                                state={state["prop-tableaux"]}
                                onChange={onChange}
                                onError={handleError}
                                onSuccess={handleSuccess}
                            />
                        </Router>
                    </main>
                    <div class={style.notifications}>
                        {notification && (
                            <Snackbar
                                notification={notification}
                                onDelete={() => removeNotification()}
                            />
                        )}
                    </div>
                </CheckClose.Provider>
            </SmallScreen.Provider>
        </div>
    );
};

export default App;
