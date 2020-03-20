import Keccak from "sha3";
import {
    AppState,
    AppStateUpdater,
    CalculusType,
    CheckCloseResponse,
    Config,
    Example,
    Move,
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
 * @param {Function} onError - Error handler
 * @param {Function} onSuccess - Success handler
 * @param {C} calculus - Calculus endpoint
 * @param {any} state - Current state for the calculus
 * @returns {Promise<void>} - Resolves when the request is done
 */
export const checkClose = async <C extends CalculusType = CalculusType>(
    server: string,
    onError: (msg: string) => void,
    onSuccess: (msg: string) => void,
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
            onError(await response.text());
        } else {
            const {
                closed,
                msg,
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
 * @param {Function} onWarning - warning handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
export const sendMove = async <C extends CalculusType = CalculusType>(
    server: string,
    calculus: C,
    state: AppState[C],
    move: Move[C],
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    onWarning: (msg: string) => void,
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
            onError(await res.text());
            return state;
        }
        const parsed = await res.json();
        stateChanger(calculus, parsed);
        if ("statusMessage" in parsed && parsed.statusMessage) {
            onWarning(parsed.statusMessage);
        }
        return parsed;
    } catch (e) {
        onError((e as Error).message);
        return state;
    }
};

// ToDo: JSDoc getConfig
export const getConfig = async (
    server: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/config`;
    try {
        // console.log(`move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`);
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "GET",
        });
        if (res.status !== 200) {
            onError(await res.text());
        }

        const parsed = await res.json();
        changeConfig(parsed);
    } catch (e) {
        onError((e as Error).message);
    }
};

// ToDo: JSDoc checkCredentials
export const checkCredentials = async (
    server: string,
    adminKey: string,
    setAdmin: (isAdmin: boolean) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/admin/checkCredentials`;
    const keccak = new Keccak(256);

    const payload = `kbcc|${getCurrentDate()}|${adminKey}`;

    keccak.update(payload);
    const mac = keccak.digest("hex");
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `mac=${mac}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            setAdmin(false);
        } else {
            const parsed = await res.json();
            if (!parsed) { 
                setAdmin(false); 
            }
            else { 
                setAdmin(parsed); 
            }
        }
    } catch (e) {
        onError((e as Error).message);
    }
};

// ToDo: JSDoc setCalculusState
export const setCalculusState = async (
    server: string,
    calculus: CalculusType,
    value: boolean,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/admin/setCalculusState`;
    const date = getCurrentDate();
    const keccak = new Keccak(256);

    const payload = `kbsc|${calculus}|${value}|${date}|${adminKey}`;

    keccak.update(payload);
    const mac = keccak.digest("hex").toUpperCase();

    try {
        // console.log(`move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`);
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `calculus=${encodeURIComponent(
                calculus,
            )}&enable=${encodeURIComponent(JSON.stringify(value))}&mac=${mac}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            return;
        }

        getConfig(server, changeConfig, onError);
    } catch (e) {
        onError((e as Error).message);
    }
};

// ToDo: JSDoc addExample
export const addExample = async (
    server: string,
    example: Example,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/admin/addExample`;
    const keccak = new Keccak(256);

    const payload = `kbae|${JSON.stringify(example)}|${getCurrentDate()}|${adminKey}`;

    keccak.update(payload);
    const mac = keccak.digest("hex").toUpperCase();

    try {
        // console.log(`move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`);
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `example=${encodeURIComponent(
                JSON.stringify(example),
            )}&mac=${mac}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            return;
        }

        getConfig(server, changeConfig, onError);
    } catch (e) {
        onError((e as Error).message);
    }
};

// ToDo: JSDoc delExample
export const delExample = async (
    server: string,
    exampleID: number,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/admin/delExample`;
    const keccak = new Keccak(256);

    const payload = `kbde|${exampleID}|${getCurrentDate()}|${adminKey}`;

    keccak.update(payload);
    const mac = keccak.digest("hex");

    try {
        // console.log(`move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`);
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `exampleID=${encodeURIComponent(
                JSON.stringify(exampleID),
            )}&mac=${mac}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            return;
        }
        getConfig(server, changeConfig, onError);
    } catch (e) {
        onError((e as Error).message);
    }
};

const getCurrentDate = () => {
    const newDate = new Date();
    const date = newDate.getUTCDate();
    const month = newDate.getUTCMonth() + 1;
    const year = newDate.getUTCFullYear();

    return `${year}${month < 10 ? `0${month}` : `${month}`}${date}`;
};
