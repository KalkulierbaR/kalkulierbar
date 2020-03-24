// Todo Admin API auslagern...
import { CalculusType, Config, Example } from "../types/app";
import { getCurrentDate, calcMac} from "./mac";

/**
 * Pulls the current config (kbar-state.json) of the backend sever
 *
 * @param server - Server
 * @param changeConfig - Change-Config handler
 * @param onError - Error handler
 */
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

/**
 * Checks if the entered Admin-Key is the same as in the kbar-state.json provided and
 * enables the admin options on success
 *
 * @param server - Server
 * @param adminKey - the key to be checked
 * @param setAdmin - Unlock admin options handler
 * @param onError - Error handler
 */
export const checkCredentials = async (
    server: string,
    adminKey: string,
    setAdmin: (isAdmin: boolean) => void,
    onError?: (msg: string) => void,
) => {
    const url = `${server}/admin/checkCredentials`;

    const payload = `kbcc|${getCurrentDate()}|${adminKey}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `mac=${calcMac(payload)}`,
        });
        if (res.status !== 200) {
            if(onError){
                onError(await res.text());
            }
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
        if(onError) {
            onError((e as Error).message);
        }
    }
};

/**
 * Changes a calculus to be disabled in the config (kbar-state.json) of the backend sever and
 * loads the new config from the backend
 *
 * @param server - Server
 * @param calculus - the calculus to be changed
 * @param disabled - whether the calculus should be disabled
 * @param adminKey - the admin key to proof authenticity of the request
 * @param changeConfig - Change config handler
 * @param onError - Error handler
 */
export const setCalculusState = async (
    server: string,
    calculus: CalculusType,
    disabled: boolean,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
) => {
    const url = `${server}/admin/setCalculusState`;

    const payload = `kbsc|${calculus}|${disabled}|${getCurrentDate()}|${adminKey}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `calculus=${encodeURIComponent(
                calculus,
            )}&enable=${encodeURIComponent(JSON.stringify(disabled))}&mac=${calcMac(payload)}`,
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

/**
 * Adds an Example to the config (kbar-state.json) of the backend server and
 * loads the new config from the backend
 *
 * @param server - Server
 * @param example - the Example object
 * @param adminKey - the admin key to proof authenticity of the request
 * @param changeConfig - Change config handler
 * @param onError - Error handler
 * @param onSuccess - Success handler
 */
export const addExample = async (
    server: string,
    example: Example,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
    onSuccess: (msg: string) => void,
) => {
    const url = `${server}/admin/addExample`;

    const payload = `kbae|${JSON.stringify(example)}|${getCurrentDate()}|${adminKey}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `example=${encodeURIComponent(
                JSON.stringify(example),
            )}&mac=${calcMac(payload)}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            return;
        }
        getConfig(server, changeConfig, onError);
        onSuccess("Example added");
    } catch (e) {
        onError((e as Error).message);
    }
};

/**
 * Adds an Example to the config (kbar-state.json) of the backend server and
 * loads the new config from the backend
 *
 * @param server - Server
 * @param exampleID - the ID of the example to be deleted
 * @param adminKey - the admin key to proof authenticity of the request
 * @param changeConfig - Change config handler
 * @param onError - Error handler
 * @param onSuccess - Success handler
 */
export const delExample = async (
    server: string,
    exampleID: number,
    adminKey: string,
    changeConfig: (cfg: Config) => void,
    onError: (msg: string) => void,
    onSuccess: (msg: string) => void,
) => {
    const url = `${server}/admin/delExample`;

    const payload = `kbde|${exampleID}|${getCurrentDate()}|${adminKey}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `exampleID=${encodeURIComponent(
                JSON.stringify(exampleID),
            )}&mac=${calcMac(payload)}`,
        });
        if (res.status !== 200) {
            onError(await res.text());
            return;
        }
        getConfig(server, changeConfig, onError);
        onSuccess("Example deleted");
    } catch (e) {
        onError((e as Error).message);
    }
};