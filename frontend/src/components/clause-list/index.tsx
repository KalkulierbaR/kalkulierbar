import { h } from "preact";
import { useState } from "preact/hooks";
import { clauseToString } from "../../helpers/clause";
import { ClauseSet } from "../../types/clause";
import * as style from "./style.css";

interface Props {
    /**
     * The clause set to display
     */
    clauseSet: ClauseSet;
}

// Displays clauses of the set as a list.
const ClauseList: preact.FunctionalComponent<Props> = ({ clauseSet }) => {
    const [userInput, setUserInput] = useState("");

    // Handle Click event
    const onClick = ({ target }: Event) => {
        const { textContent, classList} = target as HTMLParagraphElement;
        setUserInput("" + textContent);

        // Remove selected style from all previous selected clauses
        const selectedClauses = document.getElementsByClassName(style.clauseSelected);
        for(let i = 0; i < selectedClauses.length; i++){
            const item = selectedClauses.item(i)
            if(item){
                item.classList.remove(style.clauseSelected);
            }
        }

        // Add selected style to new clause
        classList.add(style.clauseSelected);

        console.log(userInput);
    };
    

    return (
        <div class="card">
            {clauseSet.clauses.map(c => (
                <p onClick={onClick} class={style.clauseListItem} >{clauseToString(c)}</p>
            ))}
        </div>
    );
};

export default ClauseList;
