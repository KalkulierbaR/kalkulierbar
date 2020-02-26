import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import FAB from "../../../components/fab";
import SendIcon from "../../../components/icons/send";
import ResolutionCircle from "../../../components/resolution/circle";
import ResolutionFactorizeDialog from "../../../components/resolution/dialog/factorize";
import ResolutionResolveDialog from "../../../components/resolution/dialog/resolve";
import ResolutionFAB from "../../../components/resolution/fab";
import { sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import {stringArrayToStringMap} from "../../../helpers/array-to-map";
import {getCandidateClause} from "../../../helpers/clause";
import {
    addHyperSidePremiss,
    findHyperSidePremiss,
    getCandidateClauses,
    getFOHyperCandidates,
    getHyperClauseIds,
    getPropHyperCandidates,
    getSelectable,
    hideClause,
    removeHyperSidePremiss, sendFactorize, sendResolve, sendResolveUnify, showHiddenClauses,
} from "../../../helpers/resolution";
import { Calculus, ResolutionCalculusType } from "../../../types/app";
import {
    CandidateClause,
    getCandidateCount,
    instanceOfPropCandidateClause,
    PropCandidateClause, SelectedClauses,
} from "../../../types/clause";
import {
    HyperResolutionMove,
    instanceOfFOResState,
    instanceOfPropResState,
} from "../../../types/resolution";
import { foExample, propExample } from "./example";
import * as style from "./style.scss";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: ResolutionCalculusType;
}

const ResolutionView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
        onError,
        onChange,
        smallScreen,
    } = useAppState();
    const apiInfo = { onChange, onError, server };

    let state = cState;
    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = calculus === Calculus.propResolution ? propExample : foExample;
        onChange(calculus, state);
    }

    const [hyperRes, setHyperRes] = useState<HyperResolutionMove | undefined>(
        undefined,
    );

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const [showFactorizeDialog, setShowFactorizeDialog] = useState(false);

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const showResolveDialog = selectedClauses !== undefined && selectedClauses.length === 2;

    const candidateClauses: CandidateClause[] = getCandidateClauses(
        state!.clauseSet,
        state!.visualHelp,
        calculus,
        selectedClauseId,
    );

    const selectedClauseAtomsEqual = (length: number) =>
        selectedClauseId === undefined
            ? false
            : state!.clauseSet.clauses[selectedClauseId].atoms.length ===
            length;

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
            setHyperRes(undefined);
        } else if (hyperRes) {
            const sidePremissId = findHyperSidePremiss(hyperRes, newClauseId);
            if (sidePremissId !== -1) {
                setHyperRes(removeHyperSidePremiss(hyperRes, sidePremissId));
                return;
            }

            // Update hyper-res move with new clause

            let candidates: Array<[number, number]> = [];

            if (instanceOfPropResState(state, calculus)) {
                const mainClause = state!.clauseSet.clauses[hyperRes.mainID];
                const selectedClause = state!.clauseSet.clauses[newClauseId];
                candidates = getPropHyperCandidates(mainClause, selectedClause);
            } else if (instanceOfFOResState(state, calculus)) {
                const mainClause = state!.clauseSet.clauses[hyperRes.mainID];
                const selectedClause = state!.clauseSet.clauses[newClauseId];
                candidates = getFOHyperCandidates(mainClause, selectedClause);
            }
            if (candidates.length === 1) {
                const [mainLitId, litId] = candidates[0];
                setHyperRes(
                    addHyperSidePremiss(
                        hyperRes,
                        mainLitId,
                        newClauseId,
                        litId,
                    ),
                );
            } else if (candidates.length > 1) {
                setSelectedClauses([selectedClauses![0], newClauseId]);
            }
            // Ignore when no candidates found
        } else {
            const candidateClause = getCandidateClause(newClauseId, candidateClauses);
            if (candidateClause != null) {
                const candidateAtomCount = getCandidateCount(candidateClause);
                if (candidateAtomCount === 0) {
                    onError("These clauses can't be resolved.");
                } else if (
                    instanceOfPropCandidateClause(candidateClause, calculus) &&
                    instanceOfPropResState(state, calculus)
                ) {
                    const options = literalOptions(candidateClause);
                    if (options.size === 1) {
                        sendResolve(
                            selectedClauseId,
                            newClauseId,
                            options.entries().next().value[1],
                            {...apiInfo, state},
                        );
                    } else {
                        // Show dialog for literal selection
                        setSelectedClauses([selectedClauses![0], newClauseId]);
                        return;
                    }
                } else if (
                    candidateAtomCount === 1 &&
                    instanceOfFOResState(state, calculus)
                ) {
                    const resolventAtomIndex = candidateClause.candidateAtomMap
                        .values()
                        .next().value[0];
                    const selectedClauseAtomIndex = candidateClause.candidateAtomMap
                        .keys()
                        .next().value;
                    sendResolveUnify(
                        selectedClauseId,
                        newClauseId,
                        selectedClauseAtomIndex,
                        resolventAtomIndex,
                        {...apiInfo, state},
                    );
                } else {
                    // Show dialog for literal selection
                    setSelectedClauses([selectedClauses![0], newClauseId]);
                    return;
                }
                // Reset selection
                setSelectedClauses(undefined);
            } else {
                throw new Error(
                    "Candidate clause could not be identified with newClauseId",
                ); // Debug error
            }
        }
    };

    /**
     * Get literal options for the propositional resolve move
     * @param {PropCandidateClause | undefined} candidateClause - The candidateClause to get options for
     * @returns {Map<string,number>} - The literal options
     */
    const literalOptions = (candidateClause?: PropCandidateClause) => {
        const options: string[] = [];
        if (
            candidateClause === undefined &&
            selectedClauses &&
            selectedClauses.length === 2
        ) {
            const newCandidateClause = candidateClauses[selectedClauses[1]];
            if (instanceOfPropCandidateClause(newCandidateClause, calculus)) {
                candidateClause = newCandidateClause;
            }
        }
        if (candidateClause !== undefined) {
            candidateClause.candidateAtomMap.forEach(
                (selectedClauseAtomIndices) =>
                    selectedClauseAtomIndices.forEach((atomIndex) => {
                        const newOption: string = candidateClause!.clause.atoms[
                            atomIndex
                            ].lit;
                        if (!options.includes(newOption)) {
                            options[atomIndex] = newOption;
                        }
                    }),
            );
        }
        return stringArrayToStringMap(options);
    };
    
    const selectable = getSelectable(
        candidateClauses,
        hyperRes,
        selectedClauseId,
        selectedClauseId !== undefined
            ? state!.clauseSet.clauses[selectedClauseId]
            : undefined,
    );
    const semiSelected = hyperRes ? getHyperClauseIds(hyperRes) : [];

    return (
        <Fragment>
            <h2>Resolution View</h2>
            <ResolutionCircle
                clauses={candidateClauses}
                selectClauseCallback={selectClauseCallback}
                selectedClauseId={selectedClauseId}
                visualHelp={state!.visualHelp}
                newestNode={state!.newestNode}
                semiSelected={semiSelected}
                selectable={selectable}
            />
            
            <ResolutionFAB 
                calculus={calculus} 
                state={state!} 
                selectedClauseId={selectedClauseId}
                hyperRes={hyperRes}
                hyperResCallback={() => {
                    if (hyperRes) {
                        setHyperRes(undefined);
                        return;
                    }
                    setHyperRes({
                        type: "res-hyper",
                        mainID: selectedClauseId!,
                        atomMap: {},
                    });
                }}
                hideCallback={() => {
                        hideClause(selectedClauseId!, calculus, {...apiInfo, state,});
                        setSelectedClauses(undefined);
                    }
                }
                showCallback={() => {
                    showHiddenClauses(calculus, {...apiInfo, state,});
                    setSelectedClauses(undefined);
                }}
                factorizeCallback={() => {
                    if (
                        ! instanceOfPropResState(state, calculus) &&
                        ! selectedClauseAtomsEqual(2)
                    ) {
                        setShowFactorizeDialog(true);
                        return;
                    }
                    sendFactorize(
                        selectedClauseId!,
                        new Set<number>([0,1]),
                        calculus,
                        {...apiInfo, state},
                    );
                    setSelectedClauses(undefined);
                }}
            />

            {hyperRes && hyperRes.atomMap && (
                <FAB
                    class={style.hyperFab}
                    label="Send"
                    icon={<SendIcon />}
                    extended={true}
                    mini={smallScreen}
                    onClick={() => {
                        sendMove(
                            server,
                            calculus,
                            state,
                            hyperRes,
                            onChange,
                            onError,
                        );
                        setHyperRes(undefined);
                        setSelectedClauses(undefined);
                    }}
                />
            )}

            <ResolutionResolveDialog
                calculus={calculus}
                state={state}
                selectedClauses={selectedClauses}
                setHyperRes={setHyperRes}
                setSelectedClauses={setSelectedClauses}
                candidateClauses={candidateClauses}
                showDialog={showResolveDialog}
                propOptions={literalOptions()}
            />

            <ResolutionFactorizeDialog 
                showDialog={showFactorizeDialog}
                calculus={calculus} 
                state={state} 
                selectedClauses={selectedClauses}
                setSelectedClauses={setSelectedClauses} 
                setShowFactorizeDialog={setShowFactorizeDialog}
            />
        </Fragment>
    );
};

export default ResolutionView;
