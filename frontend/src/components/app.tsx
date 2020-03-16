import { h } from "preact";
import AsyncRoute from "preact-async-route";
import { getCurrentUrl, Router, RouterOnChangeArgs } from "preact-router";
import { useEffect, useState } from "preact/hooks";

import { AppStateActionType, Calculus } from "../types/app";
import { AppStateProvider, useAppState } from "../util/app-state";
import Confetti from "../util/confetti";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.scss";
import {getConfig} from "../util/api";

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
 * Updates the setter with the new screen info
 * @param {Function} setter - the function to call with the new value.
 * @returns {void} - nothing. JSDoc is dumb.
 */
const updateScreenSize = (setter: (s: boolean) => void) => {
    const width = window.innerWidth;
    const smallScreen = width < SMALL_SCREEN_THRESHOLD;
    setter(smallScreen);
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
        removeNotification,
    } = useAppState();
    const saveScreenSize = (smallScreen: boolean) =>
        dispatch({
            type: AppStateActionType.UPDATE_SCREEN_SIZE,
            smallScreen,
        });
    const [currentUrl, setCurrentUrl] = useState<string>(getCurrentUrl());

    /**
     * Execute actions based upon if the route changed
     * @param {RouterOnChangeArgs} args - The arguments of the current route change
     * @returns {void}
     */
    const onChangeRoute = (args: RouterOnChangeArgs) => {
        setCurrentUrl(args.url);
        removeNotification();
    };

    useEffect(() => {
        checkServer(server, onError);

        //todo: getConfig aufruf zu programm beginn.
        //getConfig(server, /* ?? */ ,onError);

        const cf = new Confetti({ speed: 10, maxCount: 150 });

        window.addEventListener("kbar-confetti", () => {
            cf.start();

            setTimeout(() => cf.stop(), 2000);
        });

        updateScreenSize(saveScreenSize);
        window.addEventListener("resize", () =>
            updateScreenSize(saveScreenSize),
        );
    }, []);

    return (
        <div id="app">
            <Header currentUrl={currentUrl} />
            <main class={style.main}>
                <Router onChange={onChangeRoute}>
                    <AsyncRoute
                        path="/"
                        getComponent={() =>
                            import("../routes/home").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.propTableaux}
                        calculus={Calculus.propTableaux}
                        getComponent={() =>
                            import("../routes/tableaux").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.propTableaux + "/view"}
                        calculus={Calculus.propTableaux}
                        getComponent={() =>
                            import("../routes/tableaux/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path="/fo-tableaux"
                        calculus={Calculus.foTableaux}
                        getComponent={() =>
                            import("../routes/tableaux").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.foTableaux + "/view"}
                        calculus={Calculus.foTableaux}
                        getComponent={() =>
                            import("../routes/tableaux/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.propResolution}
                        calculus={Calculus.propResolution}
                        getComponent={() =>
                            import("../routes/resolution").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.propResolution + "/view"}
                        calculus={Calculus.propResolution}
                        getComponent={() =>
                            import("../routes/resolution/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.foResolution}
                        calculus={Calculus.foResolution}
                        getComponent={() =>
                            import("../routes/resolution").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.foResolution + "/view"}
                        calculus={Calculus.foResolution}
                        getComponent={() =>
                            import("../routes/resolution/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.dpll}
                        getComponent={() =>
                            import("../routes/dpll").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={"/" + Calculus.dpll + "/view"}
                        getComponent={() =>
                            import("../routes/dpll/view").then((m) => m.default)
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
            <svg id="kbar-svg" />
        </div>
    );
};

export default AppStateProvider(App);
