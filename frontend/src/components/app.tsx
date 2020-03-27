import { h } from "preact";
import AsyncRoute from "preact-async-route";
import { getCurrentUrl, Router, RouterOnChangeArgs } from "preact-router";
import { useEffect, useState } from "preact/hooks";

import {
    AppStateActionType,
    Calculus,
    NotificationHandler,
} from "../types/app";
import { AppStateProvider, useAppState } from "../util/app-state";
import Confetti from "../util/confetti";
import Page404 from "./404";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.scss";

const SMALL_SCREEN_THRESHOLD = 700;

/**
 * Check if server is online
 * @param {string} url - The url to send a request to
 * @param {NotificationHandler} notificationHandler - Notification Handler
 * @returns {Promise} - Promise that resolves when check is done
 */
async function checkServer(
    url: string,
    notificationHandler: NotificationHandler,
) {
    try {
        await fetch(url);
    } catch (e) {
        notificationHandler.error(`Server ${url} appears to be offline`);
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
        notificationHandler,
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
        notificationHandler.remove();
    };

    useEffect(() => {
        checkServer(server, notificationHandler);

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
                        path={`/${Calculus.propTableaux}`}
                        calculus={Calculus.propTableaux}
                        getComponent={() =>
                            import("../routes/tableaux").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.propTableaux}/view`}
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
                        path={`/${Calculus.foTableaux}/view`}
                        calculus={Calculus.foTableaux}
                        getComponent={() =>
                            import("../routes/tableaux/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.propResolution}`}
                        calculus={Calculus.propResolution}
                        getComponent={() =>
                            import("../routes/resolution").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.propResolution}/view`}
                        calculus={Calculus.propResolution}
                        getComponent={() =>
                            import("../routes/resolution/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.foResolution}`}
                        calculus={Calculus.foResolution}
                        getComponent={() =>
                            import("../routes/resolution").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.foResolution}/view`}
                        calculus={Calculus.foResolution}
                        getComponent={() =>
                            import("../routes/resolution/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.ncTableaux}`}
                        getComponent={() =>
                            import("../routes/nc-tableaux").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.ncTableaux}/view`}
                        getComponent={() =>
                            import("../routes/nc-tableaux/view").then(
                                (m) => m.default,
                            )
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.dpll}`}
                        getComponent={() =>
                            import("../routes/dpll").then((m) => m.default)
                        }
                    />
                    <AsyncRoute
                        path={`/${Calculus.dpll}/view`}
                        getComponent={() =>
                            import("../routes/dpll/view").then((m) => m.default)
                        }
                    />
                    <Page404 default={true} />
                </Router>
            </main>
            <div class={style.notifications}>
                {notification && (
                    <Snackbar
                        notification={notification}
                        onDelete={notificationHandler.remove}
                    />
                )}
            </div>
            <svg id="kbar-svg" />
        </div>
    );
};

export default AppStateProvider(App);
