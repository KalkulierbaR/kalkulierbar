import { h } from "preact";
import { AppState } from "../../types/app";
import Btn from "../btn";

interface Props {
    server: string;
    calculus: string;
    state: AppState[keyof AppState];
    onError: (msg: string) => void;
    onSuccess: (msg: string) => void;
}

const CheckCloseBtn: preact.FunctionalComponent<Props> = ({
    server,
    calculus,
    state,
    onError,
    onSuccess
}) => {
    /**
     * Sends a request to the server to check, if the tree is closed and
     * shows the result to the user
     *
     * @returns {Promise<void>} - Resolves when the request is done
     */
    const handleClick = async () => {
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
                const closed = (await response.json()) as boolean;
                if (closed) {
                    onSuccess("Der Baum ist geschlossen");
                } else {
                    onError("Der Baum ist nicht geschlossen");
                }
            }
        } catch (e) {
            onError((e as Error).message);
        }
    };

    return (
        <div class="card">
            <Btn onClick={handleClick}>Check</Btn>
        </div>
    );
};

export default CheckCloseBtn;
