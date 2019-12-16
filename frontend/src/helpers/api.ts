import { AppState } from "../types/app";

export type checkCloseFn<K extends keyof AppState = keyof AppState> = (
    calculus: K,
    state: AppState[K]
) => Promise<void>;

/**
 * Sends a request to the server to check, if the tree is closed and
 * shows the result to the user
 *
 * @param {string} server - Server
 * @param {Function} onError - Error handler
 * @param {Function} onSuccess - Success handler
 * @returns {Promise<void>} - Resolves when the request is done
 */
export const checkClose = (
    server: string,
    onError: (msg: string) => void,
    onSuccess: (msg: string) => void
): checkCloseFn => async <K extends keyof AppState>(
    calculus: K,
    state: AppState[K]
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
            const {closed, msg} = await response.json();
            if (closed) {
                onSuccess(msg);
            } else {
                onError(msg);
            }
        }
    } catch (e) {
        onError((e as Error).message);
    }
};
