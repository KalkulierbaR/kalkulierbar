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
    selectClauseCallback: CallableFunction;
}

// Displays clauses of the set as a list.
const ClauseList: preact.FunctionalComponent<Props> = ({
    clauseSet,
    selectedClauseId,
    selectClauseCallback
}) => {
    // Handle Click event
    const onClick = ({ target }: Event) => {
        const { id } = target as HTMLParagraphElement;
        selectClauseCallback(parseInt(id));
    };

    return (
        <div class="card">
            {clauseSet.clauses.map((c, index) => (
                <p
                    onClick={onClick}
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
