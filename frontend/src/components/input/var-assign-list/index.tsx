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
    requireAll: boolean;
    /**
     * The function to call, when the user submits the list
     */
    submitVarAssignCallback: CallableFunction;
    /**
     * Label for the submit button
     */
    submitLabel: string;
    /**
     * Additional className for the element
     */
    className?: string;
}

const VarAssignList: preact.FunctionalComponent<Props> = ({
    vars,
    requireAll,
    submitVarAssignCallback,
    submitLabel,
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
                        required={requireAll}
                        inline={true}
                    />
                </p>
            ))}
            <Btn onClick={submitVarAssignCallback(varAssign)} >
                {submitLabel}
            </Btn>
        </div>
    );
};

export default VarAssignList;
