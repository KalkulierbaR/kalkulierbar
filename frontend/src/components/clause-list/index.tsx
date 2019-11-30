import { h } from "preact";
import { clauseToString } from "../../helpers/clause";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

interface Props {
    /**
     * The clause set to display
     */
    clauseSet: ClauseSet;
    selectedClauseId: string;
    selectClauseCallback: CallableFunction;
}

// Displays clauses of the set as a list.
const ClauseList: preact.FunctionalComponent<Props> = ({clauseSet, selectedClauseId: selectedClauseKey, selectClauseCallback}) => {

    // Handle Click event
    const onClick = ({ target }: Event) => {
        const { id } = target as HTMLParagraphElement;
        selectClauseCallback(id);
    };
    
    return (
        <div class="card">
            {clauseSet.clauses.map((c, index) => (
                <p id={String(index)} onClick={onClick} class={style.clauseListItem + " " + (String(index) === selectedClauseKey ? style.clauseSelected : "")} >{clauseToString(c)}</p>
            ))}
        </div>
    );
};

export default ClauseList;
