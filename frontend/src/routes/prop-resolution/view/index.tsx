import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { AppStateUpdater } from "../../../types/app";
import * as style from "./style.css";

import { SmallScreen } from "../../../components/app";
import CheckCloseBtn from "../../../components/check-close";
import ClauseList from "../../../components/clause-list";
import { ResolutionState } from "../../../types/resolution";
import exampleState from "./example";

interface Props {
    server: string;
    state?: ResolutionState;
    onChange: AppStateUpdater<"prop-resolution">;
    onError: (msg: string) => void;
    onSuccess: (msg: string) => void;
}

/**
 * A asynchronous function to send requested move to backend
 * Updates app state with response from backend
 * @param {string} url - The url of the backend endpoint
 * @param {ResolutionState} state - The sate containing the clauseSet and nodes
 * @param {AppStateUpdater} stateChanger - A function to change app state
 * @param {Function} onError - Error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendMove = async (
    url: string,
    state: ResolutionState,
    stateChanger: AppStateUpdater<"prop-resolution">,
    onError: (msg: string) => void
) => {
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `move=&state=${JSON.stringify(state)}`
        });
        if (res.status !== 200) {
            onError(await res.text());
        } else {
            const parsed = await res.json();
            stateChanger("prop-resolution", parsed);
        }
    } catch (e) {
        onError((e as Error).message);
    }
};

// Properties Interface for the ResolutionView component
interface Props {
    server: string;
    state?: ResolutionState;
    onChange: AppStateUpdater<"prop-resolution">;
}

// Component displaying the content of the prop-tableaux route
const ResolutionView: preact.FunctionalComponent<Props> = ({
    state,
    server,
    onChange,
    onError
}) => {
    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);

    const url = `${server}/prop-resolution/`;
    const moveUrl = url + "move";

    /**
     * The function to call, when the user selects a clause
     * @param {number} newClauseId - The id of the clause, which was clicked on
     * @returns {void}
     */
    const selectClauseCallback = (newClauseId: number) => {
        if(selectedClauseId === undefined){
            setSelectedClauseId(newClauseId);
        }
        else if (newClauseId === selectedClauseId) {
            // The same clause was selected again => deselect it
            setSelectedClauseId(undefined);
        } 
        else {
            sendMove(
                moveUrl,
                state!,
                onChange,
                onError
            );
            setSelectedClauseId(newClauseId);
        }
    };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = exampleState;
    }

    return (
        <Fragment>
            <h2>Resolution View</h2>
            <SmallScreen.Consumer>
                {s => (
                    <div class={style.view}>
                        {!s && (
                            <div>
                                <ClauseList
                                    clauseSet={state!.clauseSet}
                                    selectedClauseId={selectedClauseId}
                                    selectClauseCallback={selectClauseCallback}
                                />
                                <CheckCloseBtn
                                    calculus="prop-resolution"
                                    state={state}
                                />
                            </div>
                        )}
                    </div>
                )}
            </SmallScreen.Consumer>
        </Fragment>
    );
};

export default ResolutionView;
