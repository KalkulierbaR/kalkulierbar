import { h } from "preact";
import { Router, RouterOnChangeArgs } from "preact-router";
import { useState } from "preact/hooks";

import Home from "../routes/home";
import Tableaux from "../routes/prop-tableaux";
import TableauxView from "../routes/prop-tableaux/view";
import { AppState } from "../types/app";
import Header from "./header";
import * as style from "./style.css";

// Eventually we will fetch these from the server. For now let's hard code them
const CALCULI = [
    {
        name: "Tableaux",
        id: "prop-tableaux"
    }
];

const SERVER = "http://127.0.0.1:7000";

/**
 * Check if server is online
 * @param {string} url - The url to send a request to
 * @returns {Promise} - Promise that resolves when check is done
 */
async function checkServer(url: string) {
    try {
        await fetch(url);
    } catch (e) {
        console.error(`Server ${url} appears to be offline`);
    }
}

checkServer(SERVER);

// Used for debugging with Yarn
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

// This is the main App component which handles routing and calls other components
const App: preact.FunctionalComponent = () => {
    const [state, setState] = useState<AppState>({});

    let currentUrl: string;
    const handleRoute = (e: RouterOnChangeArgs) => {
        currentUrl = e.url;
    };

    return (
        <div id="app">
            <Header />
            <main class={style.main}>
                <Router onChange={handleRoute}>
                    <Home path="/" />

                    <Tableaux
                        path="/prop-tableaux"
                        server={SERVER}
                        setState={setState}
                    />
                    <TableauxView
                        path="/prop-tableaux/view"
                        state={state["prop-tableaux"]}
                    />
                </Router>
            </main>
        </div>
    );
};

export default App;
