import { h } from "preact";
import { useState } from "preact/hooks";
import { VarAssign } from "../../../types/calculus/tableaux";
import Btn from "../../input/btn";
import TextInput from "../../input/text";
import Dialog from "../index";
import {useAppState} from "../../../util/app-state";
import * as style from "./style.scss";

interface Props {
    /**
     * Opens the dialog.
     * Defaults to `false`.
     */
    open: boolean;
    /**
     * The dialog label. Used as a heading.
     */
    dialogLabel?: string;
    /**
     * Close handler
     */
    onClose: () => void;
    /**
     * Which atoms are being combined
     */
    varOrigins?: string[];
    /**
     * Which vars shall be assigned
     */
    vars: string[];
    /**
     * Whether all variable assignments need to be provided by the user
     * Defaults to false
     */
    manualVarAssignOnly?: boolean;
    /**
     * The function to call, when the user submits the list
     */
    submitVarAssignCallback: (
        autoAssign: boolean,
        varAssign?: VarAssign,
    ) => void;
    /**
     * Label for the submit button
     */
    submitLabel?: string;
    /**
     * Label for the 2nd button
     */
    secondSubmitLabel?: string;
    /**
     * The function to call, when the user clicks the second submit button
     */
    secondSubmitEvent?: (autoAssign: boolean, varAssign?: VarAssign) => void;
    /**
     * Additional className for the element
     */
    className?: string;
}

const VarAssignDialog: preact.FunctionalComponent<Props> = ({
    open,
    dialogLabel = "Variable assignments",
    onClose,
    varOrigins = [],
    vars,
    manualVarAssignOnly = false,
    submitVarAssignCallback,
    submitLabel = "Assign like this",
    secondSubmitLabel = "Automatic",
    secondSubmitEvent,
    className,
}) => {
    const {smallScreen} = useAppState();
    const varAssign: VarAssign = {};
    const [focusedInputElement, setFocusedInputElement] = useState<string>(
        vars[0],
    );

    /**
     * Submit the manual variable assignment by the user
     * @returns {void}
     */
    const submitManualVarAssign = () => {
        vars.forEach((variable) => {
            const textInput = document.getElementById(variable);
            if (
                !(
                    textInput &&
                    textInput instanceof HTMLInputElement &&
                    textInput.value
                )
            ) {
                return;
            }
            varAssign[variable] = textInput.value;
        });
        submitVarAssignCallback(false, varAssign);
    };

    /**
     * Handle the KeyDown event of the input fields
     * @param {KeyboardEvent} e - The keyboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.keyCode === 13 && e.ctrlKey) {
            // Submit manual varAssign when hitting (enter + ctrlKey)
            submitManualVarAssign();
        } else if (e.keyCode === 13) {
            // Select next input or submit manual varAssign when hitting (enter)
            const focusedElementIndex = vars.indexOf(focusedInputElement);
            if (focusedElementIndex === vars.length - 1) {
                submitManualVarAssign();
            } else {
                const nextInput = document.getElementById(
                    vars[focusedElementIndex + 1],
                ) as HTMLInputElement;
                nextInput.focus();
            }
        }
    };

    /**
     * Handle the FocusEvent of the text input
     * @param {FocusEvent} e - The focus event
     * @returns {void}
     */
    const onFocus = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;
        setFocusedInputElement(target.id);
        target.focus();
    };

    return (
        <Dialog open={open} label={dialogLabel} onClose={onClose}>
            <div class={`card ${className}`}>
                <p class={style.originList}>
                    {varOrigins.map((origin, index) =>
                        <span key={index}>
                            <code class={style.origin}>{origin}</code>
                            {index < (varOrigins.length - 1) && " and "}
                        </span>
                    )}
                </p>
                {vars.map((variable, index) => (
                    <p key={variable}>
                        <TextInput
                            id={variable}
                            label={variable + " := "}
                            inline={true}
                            onKeyDown={onKeyDown}
                            onFocus={onFocus}
                            autoFocus={index === 0 && (!smallScreen || manualVarAssignOnly)}
                        />
                    </p>
                ))}
                <Btn onClick={submitManualVarAssign} label={submitLabel} />
                {!manualVarAssignOnly &&
                    secondSubmitLabel &&
                    secondSubmitEvent && (
                        <Btn
                            onClick={() => secondSubmitEvent(true)}
                            label={secondSubmitLabel}
                        />
                    )}
            </div>
        </Dialog>
    );
};

export default VarAssignDialog;
