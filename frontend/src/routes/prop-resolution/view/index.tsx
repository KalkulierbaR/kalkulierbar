import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { AppStateUpdater } from "../../../types/app";
import * as style from "./style.css";

import CheckCloseBtn from "../../../components/check-close";
import ClauseList from "../../../components/clause-list";
import {useAppState} from "../../../helpers/app-state";
import { CandidateClauseSet } from "../../../types/clause";
import { ResolutionMove, ResolutionState } from "../../../types/resolution";
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
 * @param {ResolutionMove} move - The move to apply on the state
 * @param {AppStateUpdater} stateChanger - A function to change app state
 * @param {Function} onError - Error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendMove = async (
    url: string,
    state: ResolutionState,
    move: ResolutionMove,
    stateChanger: AppStateUpdater<"prop-resolution">,
    onError: (msg: string) => void
) => {
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`
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
interface Props {}

// Component displaying the content of the prop-tableaux route
const ResolutionView: preact.FunctionalComponent<Props> = () => {
    const {
        server,
        ["prop-resolution"]: cState,
        onError,
        onChange
    } = useAppState();
    let state = cState;

    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);
    const [candidateClauseSet, setCandidateClauseSet] = useState<
        CandidateClauseSet | undefined
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
            // Get newly selected clause
            const selectedClause = state!.clauseSet.clauses[newClauseId];
            const newCandidateClauseSet = new CandidateClauseSet([]);
            newCandidateClauseSet.clauses[newClauseId] = {
                atoms: selectedClause.atoms, 
                candidateLiterals: []
            };

            // Filter for possible resolve candidates
            state!.clauseSet.clauses.forEach((clause, index) => {
                const literals: string[] = [];
                selectedClause.atoms.forEach(atom1 => {
                    clause.atoms.forEach(atom2 => {
                        if(atom1.lit === atom2.lit && atom1.negated !== atom2.negated){
                            literals.push(atom1.lit);
                        }
                    });
                });
                if(literals.length){
                    newCandidateClauseSet.clauses[index] = {
                        atoms: clause.atoms, 
                        candidateLiterals: literals
                    };
                }
            });

            // Set the new candidate clause set
            setCandidateClauseSet(newCandidateClauseSet);
            setSelectedClauseId(newClauseId);
        }
        else if (newClauseId === selectedClauseId) {
            // The same clause was selected again => reset selection
            setSelectedClauseId(undefined);
            setCandidateClauseSet(undefined);
        } 
        else {
            const clause2 = candidateClauseSet!.clauses[newClauseId];
            let resolventLiteral: string;
            if(clause2.candidateLiterals.length > 1){
                // Show dialog for literal selection
                // @todo implement dialog
                 resolventLiteral = clause2.candidateLiterals[0];
            }
            else{
                resolventLiteral = clause2.candidateLiterals[0];
            }
            // Send resolve move to backend
            sendMove(
                moveUrl,
                state!,
                { id1: selectedClauseId, id2: newClauseId, spelling: resolventLiteral },
                onChange,
                onError
            );
            // Reset selection
            setSelectedClauseId(undefined);
            setCandidateClauseSet(undefined);
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
            <div class={style.view}>
                <div>
                    <ClauseList
                        clauseSet={candidateClauseSet !== undefined ? candidateClauseSet : state!.clauseSet}
                        selectedClauseId={selectedClauseId}
                        selectClauseCallback={selectClauseCallback}
                    />
                    <CheckCloseBtn
                        calculus="prop-resolution"
                        state={state}
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default ResolutionView;
