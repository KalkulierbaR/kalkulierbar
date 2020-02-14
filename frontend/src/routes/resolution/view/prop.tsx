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
import {
    getPropCandidateClauses,
    hideClause,
    showHiddenClauses,
} from "../../../helpers/resolution";
import { Calculus } from "../../../types/app";
import { propExample as propExampleState } from "./example";
import * as style from "./style.scss";

interface Props {}

type SelectedClauses = undefined | [number] | [number, number];

const PropResolutionView: preact.FunctionalComponent<Props> = () => {
    const {
        server,
        [Calculus.propResolution]: cState,
        onError,
        onChange,
        onSuccess,
    } = useAppState();

    let state = cState;

    const apiInfo = { onChange, onError, server };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = propExampleState;
        onChange(Calculus.propResolution, state);
    }

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const showDialog = selectedClauses && selectedClauses.length === 2;

    const candidateClauses = getPropCandidateClauses(
        state.clauseSet,
        state.highlightSelectable,
        selectedClauseId,
    );

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
                    : candidateClause.clause.atoms[
                          candidateClause.candidateLiterals[0]
                      ].lit;

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
                        onClick={() => {
                            hideClause(
                                selectedClauseId,
                                Calculus.propResolution,
                                {
                                    ...apiInfo,
                                    state,
                                },
                            );
                            setSelectedClauses(undefined);
                        }}
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
                    onClick={() => {
                        showHiddenClauses(Calculus.propResolution, {
                            ...apiInfo,
                            state,
                        });
                        setSelectedClauses(undefined);
                    }}
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
                                            literal:
                                                candidateClauses[
                                                    selectedClauses[1]
                                                ].clause.atoms[l].lit,
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

export default PropResolutionView;
