import {
    AppState,
    AppStateUpdater,
    CalculusType,
    CheckCloseResponse,
    Move,
    NotificationHandler,
} from "../types/app";

export type checkCloseFn<C extends CalculusType = CalculusType> = (
    calculus: C,
    state: AppState[C],
) => Promise<void>;

/**
 * Sends a request to the server to check, if the tree is closed and
 * shows the result to the user
 *
 * @param {string} server - Server
 * @param {NotificationHandler} notificationHandler - Notification handler
 * @param {C} calculus - Calculus endpoint
 * @param {any} state - Current state for the calculus
 * @returns {Promise<void>} - Resolves when the request is done
 */
export const checkClose = async <C extends CalculusType = CalculusType>(
    server: string,
    notificationHandler: NotificationHandler,
    calculus: C,
    state: AppState[C],
) => {
    const url = `${server}/${calculus}/close`;
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `state=${encodeURIComponent(JSON.stringify(state))}`,
        });
        if (response.status !== 200) {
            notificationHandler.error(await response.text());
        } else {
            const {
                closed,
                msg,
            } = (await response.json()) as CheckCloseResponse;
            if (closed) {
                notificationHandler.success(msg);
                dispatchEvent(new CustomEvent("kbar-confetti"));
            } else {
                notificationHandler.error(msg);
            }
        }
    } catch (e) {
        notificationHandler.error((e as Error).message);
    }
};

/**
 * Checks that a state is valid for the given calculus
 * @param {string} server - the server
 * @param {NotificationHandler} notificationHandler - Notification handler
 * @param {CalculusType} calculus - the calculus for which to check
 * @param {string} state - string of the state to check
 * @returns {Promise<boolean>} - resolves to the validity of the state
 */
export const checkValid = async <C extends CalculusType = CalculusType>(
    server: string,
    notificationHandler: NotificationHandler,
    calculus: C,
    state: string,
) => {
    const url = `${server}/${calculus}/validate`;
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `state=${encodeURIComponent(state)}`,
        });
        if (response.status !== 200) {
            notificationHandler.error(await response.text());
        } else {
            const valid = (await response.json()) as boolean;
            if (!valid) {
                notificationHandler.error("The uploaded state is invalid");
            }
            return valid;
        }
    } catch (e) {
        notificationHandler.error((e as Error).message);
    }
    return false;
};

/**
 * A asynchronous function to send requested move to backend
 * Updates app state with response from backend
 * @param {string} server - URL of the server
 * @param {C} calculus - Calculus endpoint
 * @param {any} state - Current state for the calculus
 * @param {any} move - Move to send
 * @param {AppStateUpdater} stateChanger - Function to update the state
 * @param {NotificationHandler} notificationHandler - Notification handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendMove = async <C extends CalculusType = CalculusType>(
    server: string,
    calculus: C,
    state: AppState[C],
    move: Move[C],
    stateChanger: AppStateUpdater,
    notificationHandler: NotificationHandler,
): Promise<AppState[C]> => {
    const url = `${server}/${calculus}/move`;
    try {
        // console.log(`move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`);
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `move=${encodeURIComponent(
                JSON.stringify(move),
            )}&state=${encodeURIComponent(JSON.stringify(state))}`,
        });
        if (res.status !== 200) {
            notificationHandler.error(await res.text());
            return state;
        }
        const parsed = await res.json();
        stateChanger(calculus, parsed);
        if ("statusMessage" in parsed && parsed.statusMessage) {
            notificationHandler.warning(parsed.statusMessage);
        }
        return parsed;
    } catch (e) {
        notificationHandler.error((e as Error).message);
        return state;
    }
};
