import { h } from "preact";
import { clauseToString } from "../../helpers/clause";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

// Properties Interface for the ClauseList component
interface Props {
    /**
     * The clause set to display
     */
    clauseSet: ClauseSet;
    /**
     * The selected clause to have a unique background style
     */
    selectedClauseId: number | undefined;
    /**
     * The function to call, when the user selects a clause
     */
    selectClauseCallback: CallableFunction;
}

// Component to display a set of clauses as a list
const ClauseList: preact.FunctionalComponent<Props> = ({
    clauseSet, 
    selectedClauseId, 
    selectClauseCallback
}) => {
    
    return (
        <div class="card">
            {clauseSet.clauses.map((c, index) => (
                <p
                    onClick={() => selectClauseCallback(index)}
                    class={
                        style.clauseListItem
                        + " "
                        + (index === selectedClauseId ? style.clauseSelected : "")
                    }
                >
                    {clauseToString(c)}
                </p>
            ))}
        </div>
    );
};

export default ClauseList;
