import { createRef, h } from "preact";
import { route } from "preact-router";
import { useState } from "preact/hooks";
import {
    AppStateActionType,
    CalculusType,
    FOCalculus,
    Params,
} from "../../../types/app";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import Btn from "../../btn";
import OptionList from "../option-list";
import * as style from "./style.scss";
import { addExample } from "../../../util/api";

declare module "preact" {
    namespace JSX {
        interface HTMLAttributes<RefType extends EventTarget = EventTarget> {
            autocapitalize?: "off";
        }
    }
}

interface Props {
    /**
     * The calculus to use. Specifies API endpoint
     */
    calculus: CalculusType;
    /**
     * Additional params for the calculus
     */
    params?: Params[CalculusType];
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
 * A component for entering formulae or clause sets and sending them to the server.
 * It also redirects the user after a successful response from the server
 * to the corresponding view of the calculus
 */
const FormulaInput: preact.FunctionalComponent<Props> = ({
    calculus,
    params,
}) => {
    const {
        server,
        onError,
        onChange,
        savedFormulas,
        dispatch,
        isAdmin,
        adminKey,
    } = useAppState();

    const [textareaValue, setTextareaValue] = useState(savedFormulas[calculus]);
    const [createExample, setCreateExample] = useState(false);

    /**
     * Handle the Submit event of the form
     * @param {Event} event - The submit event
     * @returns {void}
     */
    const onSubmit = async (event: Event) => {
        event.preventDefault();
        const url = `${server}/${calculus}/parse`;

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "text/plain",
                },
                method: "POST",
                body: `formula=${normalizeInput(
                    savedFormulas[calculus],
                )}&params=${JSON.stringify(params)}`,
            });
            if (response.status !== 200) {
                onError(await response.text());
            } else {
                const parsed = await response.json();
                if (!createExample) {
                    onChange(calculus, parsed);
                    route(`/${calculus}/view`);
                } else {
                    addExample(
                        server,
                        {
                            name: "name",
                            description: "descr",
                            calculus,
                            formula: normalizeInput(savedFormulas[calculus]),
                            params: JSON.stringify(params),
                        },
                        adminKey,
                        onError,
                    );
                }
            }
        } catch (e) {
            onError((e as Error).message);
        }
    };

    const onSubmitExample = () => {
        setCreateExample(true);
    };

    const textAreaRef = createRef<HTMLTextAreaElement>();
    const suggestionsRegEx = /[\\/](a|al|all|e|ex)?$/;
    const regExMatches = suggestionsRegEx.exec(textareaValue);

    // Filter the suggestion based on the users input
    const suggestionMap = stringArrayToStringMap(
        [
            "\\all",
            "\\ex",
            "/all",
            "/ex",
            "\\all X:",
            "\\ex X:",
            "/all X:",
            "/ex X:",
        ].filter((option) => {
            if (regExMatches != null && regExMatches.length > 0) {
                return option.includes(regExMatches[0]);
            }
            return false;
        }),
    );

    /**
     * Handle the Input event of the textarea
     * @param {Event} event - The event triggered by input
     * @returns {void}
     */
    const onInput = (event: Event) => {
        const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
        target.style.height = "inherit";
        target.style.height = `${target.scrollHeight + 4}px`;

        setTextareaValue(target.value);
        dispatch({
            type: AppStateActionType.UPDATE_SAVED_FORMULA,
            calculus,
            value: target.value,
        });
    };

    /**
     * Handle the KeyDown event of the textarea
     * @param {KeyboardEvent} e - The keyboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 13 && !e.ctrlKey) {
            // Prevent submit when only hitting enter without ctrlKey
            e.stopPropagation();
        }
        if (e.keyCode === 13 && e.ctrlKey) {
            // Trigger submit when hitting (enter + ctrlKey)
            onSubmit(e);
        }
    };

    /**
     * Handle the selection of a suggestion
     * @param {[number, string]} keyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectSuggestion = (keyValuePair: [number, string]) => {
        if (textAreaRef.current === null || textAreaRef.current === undefined) {
            return;
        }
        setTextareaValue(
            textareaValue.replace(suggestionsRegEx, keyValuePair[1] + " "),
        );
        textAreaRef.current.focus();
    };

    return (
        <div class="card">
            <h3>Please enter a formula:</h3>
            <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
                <textarea
                    ref={textAreaRef}
                    name="formula"
                    class={style.input}
                    value={textareaValue}
                    onInput={onInput}
                    autofocus={true}
                    spellcheck={false}
                    autocomplete="nope"
                    autocapitalize="off"
                    autocorrect="off"
                />
                {FOCalculus.includes(calculus) ? (
                    <OptionList
                        options={suggestionMap}
                        selectOptionCallback={selectSuggestion}
                        className={
                            suggestionMap.size > 0 ? undefined : style.hide
                        }
                    />
                ) : (
                    undefined
                )}
                <Btn
                    type="submit"
                    name="action"
                    value="parse"
                    disabled={textareaValue.length === 0}
                >
                    Start proof
                </Btn>
                {isAdmin ? (
                    <Btn
                        type="submit"
                        name="action"
                        value="addExample"
                        onClick={onSubmitExample}
                        disabled={textareaValue.length === 0}
                    >
                        add Example
                    </Btn>
                ) : (
                    undefined
                )}
            </form>
        </div>
    );
};

export default FormulaInput;
