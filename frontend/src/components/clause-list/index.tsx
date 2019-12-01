import { h } from "preact";
import { clauseToString } from "../../helpers/clause";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

interface Props {
    /**
     * The clause set to display
     */
    clauseSet: ClauseSet;
    selectedClauseId: number | undefined;
    selectClauseCallback: (id: number) => void;
}

// Displays clauses of the set as a list.
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
                        style.clauseListItem +
                        " " +
                        (index === selectedClauseId ? style.clauseSelected : "")
                    }
                >
                    {clauseToString(c)}
                </p>
            ))}
        </div>
    );
};

export default ClauseList;
