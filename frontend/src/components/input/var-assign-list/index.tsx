import { h } from "preact";
import Btn from "../../btn";
import * as style from "./style.scss";

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
     * Additional className for the element
     */
    className?: string;
}

const VarAssignList: preact.FunctionalComponent<Props> = ({
    vars,
    requireAll,
    submitVarAssignCallback,
    className
}) => {
    const varAssign : Map<string, string> = new Map<string, string>();

    const onInput = ({ target }: Event) => {
        const { id, value } = target as HTMLTextAreaElement;
        varAssign.set(id, value);
    };

    return (
        <div class={`card ${className}`}>
            {vars.map((variable) => (
                <p
                    class={style.clauseListItem}
                >
                    <label for={variable}>{variable}</label>
                    <input
                        id={variable}
                        onInput={onInput}
                        required={requireAll}
                    />
                </p>
            ))}
            <Btn onClick={submitVarAssignCallback(varAssign)} >
                Submit
            </Btn>
            <input/>
        </div>
    );
};

export default VarAssignList;
