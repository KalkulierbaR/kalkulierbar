import { h } from "preact";
import { Router } from "preact-router";
import { useEffect } from "preact/hooks";

import {
    AppStateProvider,
    handleError,
    removeNotification,
    useAppState
} from "../helpers/app-state";
import Confetti from "../helpers/confetti";
import Home from "../routes/home";
import Tableaux from "../routes/prop-tableaux";
import TableauxView from "../routes/prop-tableaux/view";
import { AppStateActionType } from "../types/app";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.css";

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
    const [{ notification, server }, dispatch] = useAppState();
    const setSmallScreen = (small: boolean) =>
        dispatch({ type: AppStateActionType.SET_SMALL_SCREEN, value: small });

    useEffect(() => {
        checkServer(server, handleError(dispatch));

        const cf = new Confetti({ speed: 10, maxCount: 150 });

        window.addEventListener("kbar-confetti", () => {
            cf.start();

            setTimeout(() => cf.stop(), 2000);
        });

        updateSmallScreen(setSmallScreen);
        window.addEventListener("resize", () =>
            updateSmallScreen(setSmallScreen)
        );
    }, []);

    return (
        <div id="app">
            <Header />
            <main class={style.main}>
                <Router>
                    <Home path="/" />

                    <Tableaux path="/prop-tableaux" />
                    <TableauxView path="/prop-tableaux/view" />
                </Router>
            </main>
            <div class={style.notifications}>
                {notification && (
                    <Snackbar
                        notification={notification}
                        onDelete={removeNotification(dispatch)}
                    />
                )}
            </div>
        </div>
    );
};

export default AppStateProvider(App);
