import { h } from "preact";
import { clauseToString } from "../../helpers/clause";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

interface Props {
    clauseSet: ClauseSet;
}

const ClauseList: preact.FunctionalComponent<Props> = ({ clauseSet }) => {
    return (
        <div class="card">
            {clauseSet.clauses.map(c => (
                <p class={style.clauseListItem}>{clauseToString(c)}</p>
            ))}
        </div>
    );
};

export default ClauseList;
