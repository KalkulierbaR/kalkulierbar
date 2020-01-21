import { h } from "preact";
import AsyncRoute from "preact-async-route";
import { Router } from "preact-router";
import { useEffect } from "preact/hooks";

import { AppStateProvider, useAppState } from "../helpers/app-state";
import Confetti from "../helpers/confetti";
import {AppStateActionType} from "../types/app";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.scss";

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
    const {
        notification,
        server,
        dispatch,
        onError,
        removeNotification
    } = useAppState();
    const setSmallScreen = (small: boolean) =>
        dispatch({ type: AppStateActionType.SET_SMALL_SCREEN, value: small });

    useEffect(() => {
        checkServer(server, onError);

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
                    <AsyncRoute
                        path="/"
                        getComponent={() =>
                            import("../routes/home").then(m => m.default)
                        }
                    />
                    <AsyncRoute
                        path="/prop-tableaux"
                        calculus="prop-tableaux"
                        getComponent={() =>
                            import("../routes/tableaux").then(
                                m => m.default
                            )
                        }
                    />
                    <AsyncRoute
                        path="/prop-tableaux/view"
                        calculus="prop-tableaux"
                        getComponent={() =>
                            import("../routes/tableaux/view").then(
                                m => m.default
                            )
                        }
                    />
                    <AsyncRoute
                        path="/fo-tableaux"
                        calculus="fo-tableaux"
                        getComponent={() =>
                            import("../routes/tableaux").then(
                                m => m.default
                            )
                        }
                    />
                    <AsyncRoute
                        path="/fo-tableaux/view"
                        calculus="fo-tableaux"
                        getComponent={() =>
                            import("../routes/tableaux/view").then(
                                m => m.default
                            )
                        }
                    />
                    <AsyncRoute
                        path="/prop-resolution"
                        getComponent={() =>
                            import("../routes/prop-resolution").then(
                                m => m.default
                            )
                        }
                    />
                    <AsyncRoute
                        path="/prop-resolution/view"
                        getComponent={() =>
                            import("../routes/prop-resolution/view").then(
                                m => m.default
                            )
                        }
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
        </div>
    );
};

export default AppStateProvider(App);
