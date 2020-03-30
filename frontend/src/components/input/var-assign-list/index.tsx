import { h } from "preact";
import { useState } from "preact/hooks";
import { VarAssign } from "../../../types/calculus/tableaux";
import Btn from "../../btn";
import TextInput from "../text";

interface Props {
    /**
     * Which vars shall be assigned
     */
    vars: string[];
    /**
     * Whether all variable assignments need to be provided by the user
     */
    manualVarAssignOnly: boolean;
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
    submitLabel: string;
    /**
     * Label for the 2nd button
     */
    secondSubmitLabel: string;
    /**
     * The function to call, when the user clicks the second submit button
     */
    secondSubmitEvent?: (autoAssign: boolean, varAssign?: VarAssign) => void;
    /**
     * Additional className for the element
     */
    className?: string;
}

const VarAssignList: preact.FunctionalComponent<Props> = ({
    vars,
    manualVarAssignOnly,
    submitVarAssignCallback,
    submitLabel,
    secondSubmitLabel,
    secondSubmitEvent,
    className,
}) => {
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
        <div class={`card ${className}`}>
            {vars.map((variable, index) => (
                <p key={variable}>
                    <TextInput
                        id={variable}
                        label={variable + " := "}
                        required={manualVarAssignOnly}
                        inline={true}
                        onKeyDown={onKeyDown}
                        onFocus={onFocus}
                        autoFocus={index === 0}
                    />
                </p>
            ))}
            <Btn
                onClick={submitManualVarAssign}
                label={submitLabel}
            />
            {!manualVarAssignOnly && secondSubmitLabel && secondSubmitEvent && (
                <Btn
                    onClick={() => secondSubmitEvent(true)}
                    label={secondSubmitLabel}
                />
            )}
        </div>
    );
};

export default VarAssignList;
