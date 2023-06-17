import { ErrorBoundary, LocationProvider, Router, lazy } from "preact-iso";
import { useEffect, useState } from "preact/hooks";

import { AppStateAction, AppStateActionType } from "../types/app/action";
import { NotificationHandler } from "../types/app/notification";
import { Calculus } from "../types/calculus";
import { checkCredentials, getConfig } from "../util/admin";
import {
    AppStateProvider,
    defaultBackendServer,
    useAppState,
} from "../util/app-state";
import Confetti from "../util/confetti";
import { useTitle } from "../util/title";

import Page404 from "./404";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.module.scss";

const SMALL_SCREEN_THRESHOLD = 750;

const Home = lazy(() => import("../routes/home"));
const Tableaux = lazy(() => import("../routes/tableaux"));
const TableauxView = lazy(() => import("../routes/tableaux/view"));
const Resolution = lazy(() => import("../routes/resolution"));
const ResolutionView = lazy(() => import("../routes/resolution/view"));
const NCTableaux = lazy(() => import("../routes/nc-tableaux"));
const NCTableauxView = lazy(() => import("../routes/nc-tableaux/view"));
const DPLL = lazy(() => import("../routes/dpll"));
const DPLLView = lazy(() => import("../routes/dpll/view"));
const Sequent = lazy(() => import("../routes/sequent"));
const SequentView = lazy(() => import("../routes/sequent/view"));
const ModalTableaux = lazy(() => import("../routes/modal-tableaux"));
const ModalTableauxView = lazy(() => import("../routes/modal-tableaux/view"));

/**
 * Check if server is online
 * @param {string} url - The url to send a request to
 * @param {NotificationHandler} notificationHandler - Notification Handler
 * @param {Function} dispatch - Dispatch state actions
 * @returns {Promise} - Promise that resolves when check is done
 */
async function checkServer(
    url: string,
    notificationHandler: NotificationHandler,
    dispatch: (a: AppStateAction) => void,
) {
    try {
        await fetch(url);
    } catch (e) {
        fetch(defaultBackendServer)
            .then(() => {
                dispatch({
                    type: AppStateActionType.SET_SERVER,
                    value: defaultBackendServer,
                });
                notificationHandler.error(
                    `Switched to default server ${defaultBackendServer} since ${url} was offline`,
                );
            })
            .catch(() =>
                notificationHandler.error(
                    `Server ${url} appears to be offline`,
                ),
            );
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
    const [currentUrl, setCurrentUrl] = useState<string>("/");

    useTitle(currentUrl);

    /**
     * Execute actions based upon if the route changed
     * @param {RouterOnChangeArgs} args - The arguments of the current route change
     * @returns {void}
     */
    const onChangeRoute = (url: string) => {
        setCurrentUrl(url);
        notificationHandler.remove();
    };

    useEffect(() => {
        checkServer(server, notificationHandler, dispatch);
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
                <LocationProvider>
                    <ErrorBoundary onError={(e) => console.log(e)}>
                        <Router onRouteChange={onChangeRoute}>
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
                            <NCTableauxView
                                path={`/${Calculus.ncTableaux}/view`}
                            />
                            <DPLL path={`/${Calculus.dpll}`} />
                            <DPLLView path={`/${Calculus.dpll}/view`} />
                            <Sequent
                                path={`/${Calculus.propSequent}`}
                                calculus={Calculus.propSequent}
                            />
                            <SequentView
                                path={`/${Calculus.propSequent}/view`}
                                calculus={Calculus.propSequent}
                            />
                            <Sequent
                                path={`/${Calculus.foSequent}`}
                                calculus={Calculus.foSequent}
                            />
                            <SequentView
                                path={`/${Calculus.foSequent}/view`}
                                calculus={Calculus.foSequent}
                            />
                            <ModalTableaux
                                path={`/${Calculus.modalTableaux}`}
                                calculus={Calculus.modalTableaux}
                            />
                            <ModalTableauxView
                                path={`/${Calculus.modalTableaux}/view`}
                                calculus={Calculus.modalTableaux}
                            />
                            <Page404 default={true} />
                        </Router>
                    </ErrorBoundary>
                </LocationProvider>
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
