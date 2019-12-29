import {
    AppState,
    AppStateUpdater,
    Calculus,
    CheckCloseResponse,
    Move
} from "../types/app";

export type checkCloseFn<C extends Calculus = Calculus> = (
    calculus: C,
    state: AppState[C]
) => Promise<void>;

/**
 * Sends a request to the server to check, if the tree is closed and
 * shows the result to the user
 *
 * @param {string} server - Server
 * @param {Function} onError - Error handler
 * @param {Function} onSuccess - Success handler
 * @param {C} calculus - Calculus endpoint
 * @param {any} state - Current state for the calculus
 * @returns {Promise<void>} - Resolves when the request is done
 */
export const checkClose = async <C extends Calculus = Calculus>(
    server: string,
    onError: (msg: string) => void,
    onSuccess: (msg: string) => void,
    calculus: C,
    state: AppState[C]
) => {
    const url = `${server}/${calculus}/close`;
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `state=${JSON.stringify(state)}`
        });
        if (response.status !== 200) {
            onError(await response.text());
        } else {
            const {
                closed,
                msg
            } = (await response.json()) as CheckCloseResponse;
            if (closed) {
                onSuccess(msg);
                dispatchEvent(new CustomEvent("kbar-confetti"));
            } else {
                onError(msg);
            }
        }
    } catch (e) {
        onError((e as Error).message);
    }
};

/**
 * A asynchronous function to send requested move to backend
 * Updates app state with response from backend
 * @param {string} server - URL of the server
 * @param {C} calculus - Calculus endpoint
 * @param {any} state - Current state for the calculus
 * @param {any} move - Move to send
 * @param {AppStateUpdater} stateChanger - Function to update the state
 * @param {Function} onError - error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendMove = async <C extends Calculus = Calculus>(
    server: string,
    calculus: C,
    state: AppState[C],
    move: Move[C],
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void
) => {
    const url = `${server}/${calculus}/move`;
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`
        });
        if (res.status !== 200) {
            onError(await res.text());
        } else {
            const parsed = await res.json();
            stateChanger("prop-tableaux", parsed);
        }
    } catch (e) {
        onError((e as Error).message);
    }
};
