import { h } from "preact";
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
    submitVarAssignCallback: CallableFunction;
    /**
     * Label for the submit button
     */
    submitLabel: string;
    /**
     * Label for the 2nd button
     */
    alternativeLabel: string;
    /**
     * The function to call, when the user chooses the alternativ event
     */
    alternativeEvent?: CallableFunction;
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
    // todo: Bessere Variablen namen?
    alternativeLabel,
    alternativeEvent,
    className
}) => {
    const varAssign : Map<string, string> = new Map<string, string>();

    const onInput = ({ target }: Event) => {
        const { id, value } = target as HTMLTextAreaElement;
        varAssign.set(vars[parseInt(id)], value);
    };

    return (
        <div class={`card ${className}`}>
            {vars.map((variable, index) => (
                <p>
                    <TextInput
                        id={index.toString()}
                        label={variable + " := "}
                        onChange={() => onInput}
                        required={manualVarAssign}
                        inline={true}
                    />
                </p>
            ))}
            <Btn onClick={submitVarAssignCallback(varAssign)} >
                {submitLabel}
            </Btn>

            {!manualVarAssign && alternativeLabel && alternativeEvent? (
                <Btn onClick={alternativeEvent()}>
                    {alternativeLabel}
                </Btn>
            ) : ""}
        </div>
    );
};

export default VarAssignList;
