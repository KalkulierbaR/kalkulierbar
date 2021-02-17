import { createRef, h } from "preact";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";

import { AppStateActionType } from "../../../types/app/action";
import { CalculusType, FOCalculus, Params } from "../../../types/calculus";
import { addExample } from "../../../util/admin";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import Dialog from "../../dialog";
import AddIcon from "../../icons/add";
import SaveIcon from "../../icons/save";
import SendIcon from "../../icons/send";
import Btn from "../btn";
import UploadButton from "../btn/upload";
import OptionList from "../option-list";
import TextInput from "../text";

import * as style from "./style.scss";

declare module "preact" {
    namespace JSX {
        // tslint:disable-next-line:no-unused-declaration
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
    /**
     * Whether this is currently FO logic
     */
    foLogic: boolean;
    /**
     * Shows a Prop Placeholder
     */
    sequentPlaceholder?: boolean;
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
    foLogic,
    sequentPlaceholder = false,
}) => {
    const {
        server,
        notificationHandler,
        onChange,
        savedFormulas,
        dispatch,
        isAdmin,
        adminKey,
        setConfig,
        smallScreen,
    } = useAppState();

    const [textareaValue, setTextareaValue] = useState("");
    const [exampleNameInput, setExampleNameInput] = useState("");
    const [exampleDescriptionInput, setExampleDescriptionInput] = useState("");
    const [showCreateExampleDialog, setShowCreateExampleDialog] = useState(
        false,
    );

    useEffect(() => {
        setTextareaValue(savedFormulas[calculus]);
    }, [savedFormulas[calculus]]);

    /**
     * Handle the Submit event of the form
     * @param {Event} event - The submit event (if none is provided we add an example)
     * @returns {void}
     */
    const onSubmit = async (event?: Event) => {
        if (event) {
            event.preventDefault();
        }
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
                notificationHandler.error(await response.text());
            } else {
                const parsed = await response.json();
                if (!event) {
                    addExample(
                        server,
                        {
                            name: exampleNameInput,
                            description: exampleDescriptionInput,
                            calculus,
                            formula: normalizeInput(savedFormulas[calculus]),
                            params: params ? JSON.stringify(params) : "",
                        },
                        adminKey,
                        setConfig,
                        notificationHandler,
                    );
                    setShowCreateExampleDialog(false);
                    setExampleNameInput("");
                    setExampleDescriptionInput("");
                } else {
                    onChange(calculus, parsed);
                    route(`/${calculus}/view`);
                }
            }
        } catch (e) {
            notificationHandler.error((e as Error).message);
        }
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
                    autofocus={!smallScreen}
                    spellcheck={false}
                    autocomplete="nope"
                    autocapitalize="off"
                    autocorrect="off"
                    placeholder={
                        foLogic
                            ? sequentPlaceholder
                                ? "\\all X: (\\all Y: !(P(X) -> P(Y)) |- \\all X: !P(X)"
                                : "\\all X: !R(f(X)) & (R(f(a)) | !R(f(b))) & \\all X: R(f(X))"
                            : sequentPlaceholder
                            ? "!(a -> b) |- !b"
                            : "!a, c; a; !c"
                    }
                />
                {FOCalculus.includes(calculus) && (
                    <OptionList
                        options={suggestionMap}
                        selectOptionCallback={selectSuggestion}
                        className={
                            suggestionMap.size > 0 ? undefined : style.hide
                        }
                    />
                )}
                <Btn
                    type="submit"
                    name="action"
                    value="parse"
                    disabled={textareaValue.length === 0}
                    label="Start proof"
                    icon={<SendIcon size={20} />}
                />
                {isAdmin && (
                    <Btn
                        type="button"
                        onClick={() => setShowCreateExampleDialog(true)}
                        disabled={textareaValue.length === 0}
                        label="Add example"
                        icon={<AddIcon />}
                    />
                )}
                <UploadButton calculus={calculus} />
            </form>
            {isAdmin && (
                <Dialog
                    open={showCreateExampleDialog}
                    label="Add example"
                    onClose={() => setShowCreateExampleDialog(false)}
                >
                    <p>
                        The name and description are optional. The parameters
                        will be saved how you currently have set them.
                    </p>
                    <TextInput
                        label="Name"
                        syncValue={exampleNameInput}
                        onChange={setExampleNameInput}
                        autoComplete={true}
                        required={true}
                    />
                    <br />
                    <TextInput
                        label="Description"
                        syncValue={exampleDescriptionInput}
                        onChange={setExampleDescriptionInput}
                        autoComplete={true}
                        required={true}
                    />
                    <br />
                    <Btn
                        type="button"
                        onClick={() => onSubmit()}
                        disabled={textareaValue.length === 0}
                        label="Save like this"
                        icon={<SaveIcon />}
                    />
                </Dialog>
            )}
        </div>
    );
};

export default FormulaInput;
