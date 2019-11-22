import { h } from "preact";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

interface Props {
    clauseSet: ClauseSet;
}

const ClauseList: preact.FunctionalComponent<Props> = ({ clauseSet }) => {
    return (
        <div class="card">
            {clauseSet.clauses.map(c => (
                <p class={style.clauseListItem}>
                    {c.atoms
                        .map(a => `${a.negated ? "!" : ""}${a.lit}`)
                        .join(", ")}
                </p>
            ))}
        </div>
    );
};

export default ClauseList;
