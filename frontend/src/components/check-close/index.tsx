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
                const parsed = await response.text();
                if (parsed === "Proof closed") {
                    onSuccess(parsed);
                } else {
                    onError(parsed);
                }
            }
        } catch (e) {
            onError((e as Error).message);
        }
    };

    return (
        <div class="card">
            <Btn onClick={handleClick}>Prüfen</Btn>
        </div>
    );
};

export default CheckCloseBtn;
