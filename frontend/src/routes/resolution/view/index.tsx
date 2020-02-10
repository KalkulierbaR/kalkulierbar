import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import HideIcon from "../../../components/icons/hide";
import ShowIcon from "../../../components/icons/show";
import ResolutionCircle from "../../../components/resolution/circle";
import { checkClose, sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { Calculus } from "../../../types/app";
import { CandidateClause } from "../../../types/clause";
import exampleState from "./example";
import * as style from "./style.scss";

/**
 * Groups clauses wo are candidates near the selected clause. Keeps order intact where possible
 * @param {Array<CandidateClause>} clauses - the clauses to group
 * @param {number} selectedClauseId - the currently selected group. We will group based on this
 * @returns {void} - nothing
 */
const groupCandidates = (
    clauses: CandidateClause[],
    selectedClauseId: number,
) => {
    const notCandidates = clauses.filter(
        (c) => c.candidateLiterals.length === 0 && c.index !== selectedClauseId,
    );
    const candidates = clauses.filter(
        (c) => c.candidateLiterals.length !== 0 && c.index !== selectedClauseId,
    );

    const cs = candidates.length;
    const left = selectedClauseId - Math.floor(cs / 2);
    const right = left + cs;
    const length = clauses.length;
    let nci = 0;
    let ci = 0;
    for (let i = 0; i < length; i++) {
        if (selectedClauseId === i) {
            continue;
        }

        const ml = left + length;
        const mr = right % length;

        if (left >= 0 && right < length) {
            if (i >= left && i <= right) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        }
        // Handle wrap-around
        else if (left >= 0) {
            if ((i >= left && i < length) || i <= mr) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        } else if (right < length) {
            if ((i >= 0 && i <= right) || i >= ml) {
                clauses[i] = candidates[ci++];
            } else {
                clauses[i] = notCandidates[nci++];
            }
        } else {
            // Im 99.9% sure this can't happen. Just in case I am wrong let's log a helpful message
            throw new Error("Daniel made a horrible mistake!");
        }
    }
};

interface Props {}

type SelectedClauses = undefined | [number] | [number, number];

const ResolutionView: preact.FunctionalComponent<Props> = () => {
    const {
        server,
        [Calculus.propResolution]: cState,
        onError,
        onChange,
        onSuccess,
    } = useAppState();
    let state = cState;

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        onChange(Calculus.propResolution, exampleState);
        state = exampleState;
    }

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const showDialog = selectedClauses && selectedClauses.length === 2;

    /**
     * Creates an array of candidate clauses based on if a clause is selected
     * @returns {CandidateClause[]} - The new candidate clauses
     */
    const getCandidateClauses = () => {
        const newCandidateClauses: CandidateClause[] = [];

        if (selectedClauseId === undefined) {
            // Create default candidates
            state!.clauseSet.clauses.forEach((clause, index) => {
                newCandidateClauses[index] = {
                    atoms: clause.atoms,
                    candidateLiterals: [],
                    index,
                };
            });
        } else {
            // Get selected clause
            const selectedClause = state!.clauseSet.clauses[selectedClauseId];

            // Filter for possible resolve candidates
            state!.clauseSet.clauses.forEach((clause, index) => {
                const literals: string[] = [];
                selectedClause.atoms.forEach((atom1) => {
                    clause.atoms.forEach((atom2) => {
                        if (
                            atom1.lit === atom2.lit &&
                            atom1.negated !== atom2.negated
                        ) {
                            literals.push(atom1.lit);
                        }
                    });
                });
                newCandidateClauses[index] = {
                    atoms: clause.atoms,
                    candidateLiterals: literals,
                    index,
                };
            });

            if (state!.highlightSelectable) {
                groupCandidates(newCandidateClauses, selectedClauseId);
            }
        }
        return newCandidateClauses;
    };

    const candidateClauses = getCandidateClauses();

    /**
     * The function to call when the user selects a clause
     * @param {number} newClauseId - The id of the clause that was clicked on
     * @returns {void}
     */
    const selectClauseCallback = (newClauseId: number) => {
        if (selectedClauseId === undefined) {
            setSelectedClauses([newClauseId]);
        } else if (newClauseId === selectedClauseId) {
            // The same clause was selected again => reset selection
            setSelectedClauses(undefined);
        } else {
            const candidateClause = candidateClauses.find(
                (c) => c.index === newClauseId,
            )!;
            let resolventLiteral: string | null;
            if (candidateClause.candidateLiterals.length > 1) {
                // Show dialog for literal selection
                setSelectedClauses([selectedClauses![0], newClauseId]);
                return;
            }

            resolventLiteral =
                candidateClause.candidateLiterals.length === 0
                    ? null
                    : candidateClause.candidateLiterals[0];

            // Send resolve move to backend
            sendMove(
                server,
                Calculus.propResolution,
                state!,
                {
                    type: "res-resolve",
                    c1: selectedClauseId,
                    c2: newClauseId,
                    literal: resolventLiteral,
                },
                onChange,
                onError,
            );
            // Reset selection
            setSelectedClauses(undefined);
        }
    };

    /**
     * The function to call when the user hides a clause
     * @param {number} clauseId - The id of the clause to hide
     * @returns {void}
     */
    const hideClause = (clauseId: number) => {
        // Send hide move to backend
        sendMove(
            server,
            Calculus.propResolution,
            state!,
            {
                type: "res-hide",
                c1: clauseId,
            },
            onChange,
            onError,
        );
        // Reset selection
        setSelectedClauses(undefined);
    };

    /**
     * The function to call when the user wants to re-show hidden clauses
     * @returns {void}
     */
    const showHiddenClauses = () => {
        // Send show move to backend
        sendMove(
            server,
            Calculus.propResolution,
            state!,
            {
                type: "res-show",
            },
            onChange,
            onError,
        );
        // Reset selection
        setSelectedClauses(undefined);
    };

    return (
        <Fragment>
            <h2>Resolution View</h2>
            <ResolutionCircle
                clauses={candidateClauses}
                selectClauseCallback={selectClauseCallback}
                selectedClauseId={selectedClauseId}
                highlightSelectable={state.highlightSelectable}
                newestNode={state.newestNode}
            />
            <ControlFAB>
                {selectedClauseId !== undefined ? (
                    <FAB
                        mini={true}
                        extended={true}
                        label="Hide clause"
                        showIconAtEnd={true}
                        icon={<HideIcon />}
                        onClick={() => hideClause(selectedClauseId)}
                    />
                ) : (
                    undefined
                )}
                <FAB
                    mini={true}
                    extended={true}
                    label="Show all"
                    showIconAtEnd={true}
                    icon={<ShowIcon />}
                    onClick={showHiddenClauses}
                />
                <FAB
                    mini={true}
                    extended={true}
                    label="Center"
                    showIconAtEnd={true}
                    icon={<CenterIcon />}
                    onClick={() => dispatchEvent(new CustomEvent("center"))}
                />
                <FAB
                    icon={<CheckCircleIcon />}
                    label="Check"
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() =>
                        checkClose(
                            server,
                            onError,
                            onSuccess,
                            Calculus.propResolution,
                            state,
                        )
                    }
                />
            </ControlFAB>
            <Dialog
                open={showDialog}
                label="Choose Literal"
                onClose={() => setSelectedClauses([selectedClauses![0]])}
            >
                {selectedClauses &&
                    selectedClauses.length === 2 &&
                    candidateClauses[selectedClauses[1]].candidateLiterals.map(
                        (l) => (
                            <p
                                class={style.listItem}
                                onClick={() => {
                                    sendMove(
                                        server,
                                        Calculus.propResolution,
                                        state!,
                                        {
                                            type: "res-resolve",
                                            c1: selectedClauseId!,
                                            c2: selectedClauses[1],
                                            literal: l,
                                        },
                                        onChange,
                                        onError,
                                    );
                                    setSelectedClauses(undefined);
                                }}
                            >
                                {l}
                            </p>
                        ),
                    )}
            </Dialog>
        </Fragment>
    );
};

export default ResolutionView;
