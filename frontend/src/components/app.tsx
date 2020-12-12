import { h } from "preact";
import { getCurrentUrl, Router, RouterOnChangeArgs } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { AppStateProvider, useAppState } from "../util/app-state";
import Confetti from "../util/confetti";
import Page404 from "./404";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.scss";
import { useTitle } from "../util/title";
import Home from "async!../routes/home";
import Tableaux from "async!../routes/tableaux";
import TableauxView from "async!../routes/tableaux/view";
import Resolution from "async!../routes/resolution";
import ResolutionView from "async!../routes/resolution/view";
import NCTableaux from "async!../routes/nc-tableaux";
import NCTableauxView from "async!../routes/nc-tableaux/view";
import DPLL from "async!../routes/dpll";
import DPLLView from "async!../routes/dpll/view";
import { NotificationHandler } from "../types/app/notification";
import { AppStateActionType } from "../types/app/action";
import { Calculus } from "../types/calculus";
import { getConfig, checkCredentials } from "../util/admin";
import PSC from "async!../routes/psc";

const SMALL_SCREEN_THRESHOLD = 750;

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
        setConfig,
        adminKey,
    } = useAppState();
    const saveScreenSize = (smallScreen: boolean) =>
        dispatch({
            type: AppStateActionType.UPDATE_SCREEN_SIZE,
            smallScreen,
        });
    const [currentUrl, setCurrentUrl] = useState<string>(getCurrentUrl());

    useTitle(currentUrl);

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
        getConfig(server, setConfig);
    }, [server]);

    useEffect(() => {
        if (adminKey) {
            checkCredentials(
                server,
                adminKey,
                (userIsAdmin) =>
                    dispatch({
                        type: AppStateActionType.SET_ADMIN,
                        value: userIsAdmin,
                    }),
                notificationHandler,
            );
        }

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
                    <Home path="/" />
                    <Tableaux
                        path={`/${Calculus.propTableaux}`}
                        calculus={Calculus.propTableaux}
                    />
                    <TableauxView
                        path={`/${Calculus.propTableaux}/view`}
                        calculus={Calculus.propTableaux}
                    />
                    <Tableaux
                        path="/fo-tableaux"
                        calculus={Calculus.foTableaux}
                    />
                    <TableauxView
                        path={`/${Calculus.foTableaux}/view`}
                        calculus={Calculus.foTableaux}
                    />
                    <Resolution
                        path={`/${Calculus.propResolution}`}
                        calculus={Calculus.propResolution}
                    />
                    <ResolutionView
                        path={`/${Calculus.propResolution}/view`}
                        calculus={Calculus.propResolution}
                    />
                    <Resolution
                        path={`/${Calculus.foResolution}`}
                        calculus={Calculus.foResolution}
                    />
                    <ResolutionView
                        path={`/${Calculus.foResolution}/view`}
                        calculus={Calculus.foResolution}
                    />
                    <NCTableaux path={`/${Calculus.ncTableaux}`} />
                    <NCTableauxView path={`/${Calculus.ncTableaux}/view`} />
                    <DPLL path={`/${Calculus.dpll}`} />
                    <DPLLView path={`/${Calculus.dpll}/view`} />
                    <PSC path="/psc" />
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
