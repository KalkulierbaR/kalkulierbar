import { h } from "preact";
import { route } from "preact-router";
import { useState } from "preact/hooks";
import { useAppState } from "../../../helpers/app-state";
import { Calculus, Params } from "../../../types/app";
import Btn from "../../btn";
import * as style from "./style.scss";

declare module "preact" {
    namespace JSX {
        interface HTMLAttributes<RefType extends EventTarget = EventTarget> {
            autocapitalize?: "off";
        }
    }
}

// Properties Interface for the ClauseInput component
interface Props {
    /**
     * The calculus to use. Specifies API endpoint
     */
    calculus: Calculus;
    /**
     * Additional params for the calculus
     */
    params?: Params[Calculus];
}

/**
 * Normalizes the user input. It replaces multiple newlines with just one,
 * replaces newlines by semicolon and removes whitespace
 * @param {string} input - The user input
 * @returns {string} - Normalized clause string
 */
const normalizeInput = (input: string) => {
    input = input.replace(/\n+$/, "");
    input = input.replace(/\n+/g, "\n");
    return encodeURIComponent(input);
};

/*
 * A component for entering clause sets and sending them to the server.
 * It also redirects the user after a successful response from the server
 * to the corresponding view of the calculus
 */
const FormulaInput: preact.FunctionalComponent<Props> = ({
    calculus,
    params
}) => {
    const { server, onError, onChange } = useAppState();
    const [userInput, setUserInput] = useState("");
    const url = `${server}/${calculus}/parse`;

    /**
     * Handle the Submit event of the form
     * @param {Event} event - The submit event
     * @returns {void}
     */
    const onSubmit = async (event: Event) => {
        event.preventDefault();

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "text/plain"
                },
                method: "POST",
                body: `formula=${normalizeInput(
                    userInput
                )}&params=${JSON.stringify(params)}`
            });
            if (response.status !== 200) {
                onError(await response.text());
            } else {
                const parsed = await response.json();
                onChange(calculus, parsed);
                route(`/${calculus}/view`);
            }
        } catch (e) {
            onError((e as Error).message);
        }
    };

    /**
     * Handle the Input event of the textarea
     * @param {EventTarget} target - The HTML element which received input
     * @returns {void}
     */
    const onInput = ({ target }: Event) => {
        const { value } = target as HTMLTextAreaElement;
        setUserInput(value);
    };

    /**
     * Handle the KeyDown event of the textarea
     * @param {KeyboardEvent} e - The keyboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 13 && !e.ctrlKey) {
            // Prevent submit when hitting enter
            e.stopPropagation();
        }
        if (e.keyCode === 13 && e.ctrlKey) {
            // Trigger submit when using ctrlKey
            // TODO: This should be done via event, don't know why it doesn't work
            onSubmit(e);
        }
    };

    return (
        <div class="card">
            <h3>Please enter a formula:</h3>
            <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
                <textarea
                    name="formula"
                    class={style.input}
                    value={userInput}
                    onInput={onInput}
                    autocapitalize="off"
                />
                <Btn type="submit" disabled={userInput.length === 0}>
                    Start proof
                </Btn>
            </form>
        </div>
    );
};

export default FormulaInput;
