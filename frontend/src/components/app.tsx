import { h } from "preact";
import { Route, Router, RouterOnChangeArgs } from "preact-router";

import Home from "../routes/home";
import Header from "./header";

// Eventually we will fetch these from the server. For now let's hard code them
const CALCULI = ["clause"];

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
    let currentUrl: string;
    const handleRoute = (e: RouterOnChangeArgs) => {
        currentUrl = e.url;
    };

    return (
        <div id="app">
            <Header />
            <Router onChange={handleRoute}>
                <Home path="/" calculus="clause" server={SERVER} />
            </Router>
        </div>
    );
};

export default App;
