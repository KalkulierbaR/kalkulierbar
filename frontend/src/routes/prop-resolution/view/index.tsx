import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import * as style from "./style.css";

import CheckCloseBtn from "../../../components/check-close";
import ResolutionCircle from "../../../components/resolution/circle";
import { sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { CandidateClause } from "../../../types/clause";
import exampleState from "./example";

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

    const getCandidateClauses = () => {
        const newCandidateClauses: CandidateClause[] = [];

        if (selectedClauseId === undefined) {
            // Create default candidates
            state!.clauseSet.clauses.forEach((clause, index) => {
                newCandidateClauses[index] = {
                    id: index,
                    atoms: clause.atoms,
                    candidateLiterals: []
                };
            });
        }
        else{
            // Get selected clause
            const selectedClause = state!.clauseSet.clauses[selectedClauseId];

            // Filter for possible resolve candidates
            state!.clauseSet.clauses.forEach((clause, index) => {
                const literals: string[] = [];
                selectedClause.atoms.forEach(atom1 => {
                    clause.atoms.forEach(atom2 => {
                        if (
                            atom1.lit === atom2.lit &&
                            atom1.negated !== atom2.negated
                        ) {
                            literals.push(atom1.lit);
                        }
                    });
                });
                newCandidateClauses[index] = {
                    id: index,
                    atoms: clause.atoms,
                    candidateLiterals: literals
                };
            });
        }
       return newCandidateClauses;
    }

    /**
     * The function to call, when the user selects a clause
     * @param {number} newClauseId - The id of the clause, which was clicked on
     * @returns {void}
     */
    const selectClauseCallback = (newClauseId: number) => {
        if (selectedClauseId === undefined) {
            setSelectedClauseId(newClauseId);
        } else if (newClauseId === selectedClauseId) {
            // The same clause was selected again => reset selection
            setSelectedClauseId(undefined);
        } else {
            const candidateClause = getCandidateClauses()[newClauseId];
            let resolventLiteral: string;
            if (candidateClause.candidateLiterals.length > 1) {
                // Show dialog for literal selection
                // @todo implement dialog
                resolventLiteral = candidateClause.candidateLiterals[0];
            } else {
                resolventLiteral = candidateClause.candidateLiterals[0];
            }
            // Send resolve move to backend
            sendMove(
                server,
                "prop-resolution",
                state!,
                {
                    c1: selectedClauseId,
                    c2: newClauseId,
                    spelling: resolventLiteral
                },
                onChange,
                onError
            );
            // Reset selection
            setSelectedClauseId(undefined);
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
                    <CheckCloseBtn calculus="prop-resolution" />
                </div>
                <ResolutionCircle
                    clauses={getCandidateClauses()}
                    selectClauseCallback={selectClauseCallback}
                    selectedClauseId={selectedClauseId}
                />
            </div>
        </Fragment>
    );
};

export default ResolutionView;
