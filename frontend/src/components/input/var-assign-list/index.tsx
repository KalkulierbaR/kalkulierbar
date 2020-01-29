import { h } from "preact";
import { VarAssign } from "../../../types/tableaux";
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
    manualVarAssign: boolean;
    /**
     * The function to call, when the user submits the list
     */
    submitVarAssignCallback: (va?: VarAssign) => void;
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
    secondSubmitEvent?: (va?: VarAssign) => void;
    /**
     * Additional className for the element
     */
    className?: string;
}

const VarAssignList: preact.FunctionalComponent<Props> = ({
    vars,
    manualVarAssign,
    submitVarAssignCallback,
    submitLabel,
    secondSubmitLabel,
    secondSubmitEvent,
    className
}) => {
    const varAssign: VarAssign = {};

    /**
     * Submit the manual variable assignment by the user
     * @returns {void}
     */
    const submitVarAssign = () => {
        vars.forEach(variable => {
            const textInput = document.getElementById(variable);
            if (!(textInput && textInput instanceof HTMLInputElement && textInput.value)) {
                return;
            }
            varAssign[variable] = textInput.value;
        });
        submitVarAssignCallback(varAssign);
    };

    return (
        <div class={`card ${className}`}>
            {vars.map(variable => (
                <p>
                    <TextInput
                        id={variable}
                        label={variable + " := "}
                        required={manualVarAssign}
                        inline={true}
                    />
                </p>
            ))}
            <Btn onClick={submitVarAssign}>{submitLabel}</Btn>

            {!manualVarAssign && secondSubmitLabel && secondSubmitEvent ? (
                <Btn onClick={() => secondSubmitEvent()}>
                    {secondSubmitLabel}
                </Btn>
            ) : (
                ""
            )}
        </div>
    );
};

export default VarAssignList;
