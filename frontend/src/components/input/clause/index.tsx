import { h } from "preact";
import { route } from "preact-router";
import { useState } from "preact/hooks";
import { AppState, AppStateUpdater } from "../../../types/app";
import Btn from "../../btn";
import * as style from "./style.css";

// Interface for properties
interface Props {
    /**
     * The calculus to use. Specifies API endpoint
     */
    calculus: keyof AppState;
    /**
     * URL to the server
     */
    server: string;
    /**
     * The function to call, when the state associated with the calculus changed
     */
    onChange: AppStateUpdater;
}

/**
 * Normalizes the user input. It replaces multiple newlines with just one,
 * replaces newlines by semicolon and removes whitespace
 * @param {string} input - The user input
 * @returns {string} - Normalized clause string
 */
const normalizeInput = (input: string) => {
    input = input.replace(/\n+/g, "\n");
    input = input.replace(/\n/g, ";");
    input = input.replace(/\s/g, "");
    return input;
};

/*
 * A component for entering clause sets and sending them to the server.
 * It also redirects the user after a successful response from the server
 * to the corresponding view of the calculus
 *
 */
const ClauseInput: preact.FunctionalComponent<Props> = ({
    calculus,
    server,
    onChange
}) => {
    const [userInput, setUserInput] = useState("");
    const url = `${server}/${calculus}/parse`;

    // Handle Submit event
    const onSubmit = async (event: Event) => {
        event.preventDefault();
        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "text/plain"
                },
                method: "POST",
                body: `formula=${normalizeInput(userInput)}`
            });
            const parsed = await response.json();
            onChange(calculus, parsed);
            route(`/${calculus}/view`);
        } catch (e) {
            console.error(e);
        }
    };

    // Handle Input event
    const onInput = ({ target }: Event) => {
        const { value } = target as HTMLTextAreaElement;
        setUserInput(value);
    };

    // Handle KeyDown event
    const onKeyDown = (e: KeyboardEvent) => {
        // Prevent submit when hitting enter
        if (e.keyCode === 13 && !e.ctrlKey) {
            e.stopPropagation();
        }
        // Trigger submit when using ctrlKey
        // TODO: This should be done via event, don't know why it doesn't work
        if (e.keyCode === 13 && e.ctrlKey) {
            onSubmit(e);
        }
    };

    return (
        <div class="card">
            <h3>Bitte gebe eine Klauselmenge ein:</h3>
            <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
                <textarea
                    name="formula"
                    class={style.input}
                    value={userInput}
                    onInput={onInput}
                />
                <Btn type="submit" disabled={userInput.length === 0}>
                    Senden
                </Btn>
            </form>
        </div>
    );
};

export default ClauseInput;
