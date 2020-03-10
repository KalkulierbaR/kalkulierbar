import { h } from "preact";
import { useState } from "preact/hooks";
import Dialog from "../../../components/dialog";
import OptionList from "../../../components/input/option-list";
import { useAppState } from "../../../helpers/app-state";
import { atomToString, getCandidateClause } from "../../../helpers/clause";
import {
    addHyperSidePremiss,
    findOptimalMainLit,
    sendResolve,
    sendResolveUnify,
} from "../../../helpers/resolution";
import { ResolutionCalculusType } from "../../../types/app";
import {
    CandidateClause,
    Clause,
    SelectedClauses,
} from "../../../types/clause";
import {
    FOResolutionState,
    HyperResolutionMove,
    instanceOfFOResState,
    instanceOfPropResState,
    PropResolutionState,
} from "../../../types/resolution";

interface Props {
    /**
     * Whether the dialog should be displayed open
     */
    showDialog: boolean;
    /**
     * Which calculus to use
     */
    calculus: ResolutionCalculusType;
    /**
     * The current calculus state
     */
    state: PropResolutionState | FOResolutionState;
    /**
     * The currently selected clauses
     */
    selectedClauses: SelectedClauses;
    /**
     * Set selected clauses
     */
    setSelectedClauses: (clauses: SelectedClauses) => void;
    /**
     * The Hyper Resolution Move if one is given
     */
    hyperRes?: HyperResolutionMove;
    /**
     * Set the Hyper Resolution Move
     */
    setHyperRes: (move: HyperResolutionMove | undefined) => void;
    /**
     * Candidate clauses for resolving
     */
    candidateClauses: CandidateClause[];
    /**
     * Options for the propositional dialog
     */
    propOptions: Map<number, string>;
}

const ResolutionResolveDialog: preact.FunctionalComponent<Props> = ({
    showDialog,
    calculus,
    state,
    selectedClauses,
    setSelectedClauses,
    hyperRes,
    setHyperRes,
    candidateClauses,
    propOptions,
}) => {
    const { server, onError, onChange, onWarning } = useAppState();
    const apiInfo = { onChange, onError, server, onWarning };

    const [selectedClauseAtomOption, setSelectedClauseAtomOption] = useState<
        number | undefined
    >(undefined);
    const [candidateClauseAtomOption, setCandidateClauseAtomOption] = useState<
        number | undefined
    >(undefined);

    /**
     * Handler for the selection of a literal option in the propositional resolve dialog
     * @param {[number, string]} keyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectLiteralOption = (keyValuePair: [number, string]) => {
        if (
            selectedClauses &&
            selectedClauses.length === 2 &&
            instanceOfPropResState(state, calculus)
        ) {
            if (hyperRes) {
                setHyperRes(
                    addHyperSidePremiss(
                        hyperRes,
                        findOptimalMainLit(
                            hyperRes,
                            state!.clauseSet.clauses[
                                selectedClauses[0]
                            ] as Clause,
                            (state!.clauseSet.clauses[
                                selectedClauses[1]
                            ] as Clause).atoms[keyValuePair[0]].lit,
                        ),
                        selectedClauses[1],
                        keyValuePair[0],
                    ),
                );
                setSelectedClauses([selectedClauses[0]]);
                return;
            }
            sendResolve(
                selectedClauses[0],
                selectedClauses[1],
                keyValuePair[1],
                { ...apiInfo, state },
            );
        }
        setSelectedClauses(undefined);
    };

    /**
     * Get atom options for the FO resolve move
     * @returns {[][]} - The relevant atom options with options[0] containing selectedClause's atoms
     *                   and options[1] containing candidateClause's atoms
     */
    const foAtomOptions = () => {
        const options = [new Map<number, string>(), new Map<number, string>()];
        if (selectedClauses && selectedClauses.length === 2) {
            const candidateClause = getCandidateClause(
                selectedClauses[1],
                candidateClauses,
            );
            if (candidateClause != null) {
                const uniqueCandidateClauseAtomIndices = new Set<number>();
                candidateClause.candidateAtomMap.forEach(
                    (
                        candidateAtomIndices: number[],
                        selectedClauseAtomIndex: number,
                    ) => {
                        options[0].set(
                            selectedClauseAtomIndex,
                            atomToString(
                                state!.clauseSet.clauses[selectedClauses[0]]
                                    .atoms[selectedClauseAtomIndex],
                            ),
                        );
                        candidateAtomIndices.forEach((candidateAtomIndex) =>
                            uniqueCandidateClauseAtomIndices.add(
                                candidateAtomIndex,
                            ),
                        );
                    },
                );
                uniqueCandidateClauseAtomIndices.forEach(
                    (candidateClauseAtomIndex: number) => {
                        options[1].set(
                            candidateClauseAtomIndex,
                            atomToString(
                                state!.clauseSet.clauses[selectedClauses[1]]
                                    .atoms[candidateClauseAtomIndex],
                            ),
                        );
                    },
                );
            }
        }
        return options;
    };

    /**
     * Handler for the closure of the FO resolve dialog
     * @returns {void}
     */
    const onCloseAtomDialog = () => {
        setCandidateClauseAtomOption(undefined);
        setSelectedClauseAtomOption(undefined);
        if (!hyperRes) {
            setSelectedClauses(undefined);
        } else {
            setSelectedClauses(selectedClauses && [selectedClauses[0]]);
        }
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (selectedClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectSelectedClauseAtomOption = (
        optionKeyValuePair: [number, string],
    ) => {
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (selectedClauseAtomOption === optionKeyValuePair[0]) {
            setSelectedClauseAtomOption(undefined);
        } else if (candidateClauseAtomOption === undefined) {
            setSelectedClauseAtomOption(optionKeyValuePair[0]);
        } else if (hyperRes) {
            setHyperRes(
                addHyperSidePremiss(
                    hyperRes,
                    optionKeyValuePair[0],
                    selectedClauses[1],
                    candidateClauseAtomOption,
                ),
            );
            onCloseAtomDialog();
        } else if (instanceOfFOResState(state, calculus)) {
            sendResolveUnify(
                selectedClauses[0],
                selectedClauses[1],
                optionKeyValuePair[0],
                candidateClauseAtomOption,
                { ...apiInfo, state },
            );
            onCloseAtomDialog();
        }
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (candidateClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectCandidateAtomOption = (
        optionKeyValuePair: [number, string],
    ) => {
        const atomIndex = optionKeyValuePair[0];
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (candidateClauseAtomOption === atomIndex) {
            setCandidateClauseAtomOption(undefined);
        } else if (selectedClauseAtomOption === undefined) {
            setCandidateClauseAtomOption(atomIndex);
        } else if (hyperRes) {
            setHyperRes(
                addHyperSidePremiss(
                    hyperRes,
                    selectedClauseAtomOption,
                    selectedClauses[1],
                    atomIndex,
                ),
            );
            onCloseAtomDialog();
        } else if (instanceOfFOResState(state, calculus)) {
            sendResolveUnify(
                selectedClauses[0],
                selectedClauses[1],
                selectedClauseAtomOption,
                atomIndex,
                { ...apiInfo, state },
            );
            onCloseAtomDialog();
        }
    };

    return instanceOfPropResState(state, calculus) ? (
        <Dialog
            open={showDialog}
            label="Choose a literal to resolve"
            onClose={() => setSelectedClauses([selectedClauses![0]])}
        >
            <OptionList
                options={propOptions}
                selectOptionCallback={selectLiteralOption}
            />
        </Dialog>
    ) : (
        <Dialog
            open={showDialog}
            label="Choose 2 atoms to resolve"
            onClose={onCloseAtomDialog}
        >
            <OptionList
                options={foAtomOptions()[0]}
                selectedOptionIds={
                    selectedClauseAtomOption !== undefined
                        ? [selectedClauseAtomOption]
                        : undefined
                }
                selectOptionCallback={selectSelectedClauseAtomOption}
            />
            <hr />
            <OptionList
                options={foAtomOptions()[1]}
                selectedOptionIds={
                    candidateClauseAtomOption !== undefined
                        ? [candidateClauseAtomOption]
                        : undefined
                }
                selectOptionCallback={selectCandidateAtomOption}
            />
        </Dialog>
    );
};

export default ResolutionResolveDialog;
