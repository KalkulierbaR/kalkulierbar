import { h } from "preact";
import { Router } from "preact-router";
import { useEffect, useState } from "preact/hooks";

import Home from "../routes/home";
import Tableaux from "../routes/prop-tableaux";
import TableauxView from "../routes/prop-tableaux/view";
import { AppState, Notification, NotificationType } from "../types/app";
import Header from "./header";
import Snackbar from "./snackbar";
import * as style from "./style.css";

const SERVER = `http://${window.location.hostname}:7000`;

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

// Used for debugging with Yarn
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

// This is the main App component which handles routing and calls other components
const App: preact.FunctionalComponent = () => {
    const [state, setState] = useState<AppState>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (n: Notification) =>
        setNotifications([...notifications, n]);

    const removeNotification = (idx: number) => {
        setNotifications(notifications.filter((_, i) => idx !== i));
    };

    const handleError = (msg: string) =>
        addNotification({ type: NotificationType.Error, message: msg });

    const handleSuccess = (msg: string) =>
        addNotification({ type: NotificationType.Success, message: msg });

    const handleMessage = (
        msg: string,
        type: NotificationType = NotificationType.None
    ) => addNotification({ type, message: msg });

    useEffect(() => {
        checkServer(SERVER, handleError);
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

    return (
        <div id="app">
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
                {notifications.map((n, i) => (
                    <Snackbar
                        notification={n}
                        onDelete={() => removeNotification(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;
