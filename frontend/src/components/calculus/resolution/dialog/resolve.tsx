import {Fragment, h} from "preact";
import {useState} from "preact/hooks";

import Dialog from "../../../../components/dialog";
import OptionList from "../../../../components/input/option-list";
import {ResolutionCalculusType} from "../../../../types/calculus";
import {CandidateClause, Clause, SelectedClauses,} from "../../../../types/calculus/clause";
import {
    FOResolutionState,
    HyperResolutionMove,
    instanceOfFOResState,
    instanceOfPropResState,
    PropResolutionState,
} from "../../../../types/calculus/resolution";
import {VarAssign} from "../../../../types/calculus/tableaux";
import {useAppState} from "../../../../util/app-state";
import {atomToString, checkAtomsForVars, getCandidateClause,} from "../../../../util/clause";
import {
    addHyperSidePremiss,
    findOptimalMainLit,
    sendResolve,
    sendResolveCustom,
    sendResolveUnify,
} from "../../../../util/resolution";
import VarAssignDialog from "../../../dialog/var-assign";

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
    const { server, onChange, notificationHandler } = useAppState();
    const apiInfo = { onChange, notificationHandler, server };

    const [firstClauseAtomIndex, setFirstClauseAtomIndex] = useState<
        number | undefined
    >(undefined);
    const [secondClauseAtomIndex, setSecondClauseAtomIndex] = useState<
        number | undefined
    >(undefined);

    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);
    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

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
        setFirstClauseAtomIndex(undefined);
        setSecondClauseAtomIndex(undefined);
        if (!hyperRes) {
            setSelectedClauses(undefined);
        } else {
            setSelectedClauses(selectedClauses && [selectedClauses[0]]);
        }
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (selectedClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @param {number | undefined} clickedOnClauseAtomIndex - The current atom index of the clause which was clicked on
     * @param {VoidFunction} otherClauseAtomIndex - The other clause's current atom index
     * @param {number | undefined} setClickedOnClauseAtomIndex - Function to set the atom index
     * @param {number | undefined} clickedOnClauseIsFirstClause - Whether the clicked on clause is also the first clause
     * @returns {void}
     */
    const selectAtomOption = (
        optionKeyValuePair: [number, string],
        clickedOnClauseAtomIndex: number | undefined,
        otherClauseAtomIndex: number | undefined,
        setClickedOnClauseAtomIndex: (option: number | undefined) => void,
        clickedOnClauseIsFirstClause: boolean,
    ) => {
        const atomIndex = optionKeyValuePair[0];
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (clickedOnClauseAtomIndex === atomIndex) {
            setClickedOnClauseAtomIndex(undefined);
        } else if (otherClauseAtomIndex === undefined) {
            setClickedOnClauseAtomIndex(atomIndex);
        } else if (hyperRes) {
            setHyperRes(
                addHyperSidePremiss(
                    hyperRes,
                    clickedOnClauseIsFirstClause
                        ? atomIndex
                        : otherClauseAtomIndex,
                    selectedClauses[1],
                    clickedOnClauseIsFirstClause
                        ? otherClauseAtomIndex
                        : atomIndex,
                ),
            );
            onCloseAtomDialog();
        } else if (instanceOfFOResState(state, calculus)) {
            setClickedOnClauseAtomIndex(atomIndex);
            const atom1 =
                state.clauseSet.clauses[selectedClauses[0]].atoms[
                    clickedOnClauseIsFirstClause
                        ? atomIndex
                        : otherClauseAtomIndex
                ];
            const atom2 =
                state.clauseSet.clauses[selectedClauses[1]].atoms[
                    clickedOnClauseIsFirstClause
                        ? otherClauseAtomIndex
                        : atomIndex
                ];
            const vars = new Set<string>();
            checkAtomsForVars(vars, [atom1, atom2]);
            if (vars.size > 0) {
                setVarOrigins([atomToString(atom1), atomToString(atom2)]);
                setVarsToAssign(Array.from(vars));
                setShowVarAssignDialog(true);
            } else {
                sendResolveUnify(
                    selectedClauses[0],
                    selectedClauses[1],
                    clickedOnClauseIsFirstClause
                        ? atomIndex
                        : otherClauseAtomIndex,
                    clickedOnClauseIsFirstClause
                        ? otherClauseAtomIndex
                        : atomIndex,
                    { ...apiInfo, state },
                );
                onCloseAtomDialog();
            }
        }
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (selectedClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectFirstClauseAtomOption = (
        optionKeyValuePair: [number, string],
    ) => {
        selectAtomOption(
            optionKeyValuePair,
            firstClauseAtomIndex,
            secondClauseAtomIndex,
            setFirstClauseAtomIndex,
            true,
        );
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (candidateClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectSecondClauseAtomOption = (
        optionKeyValuePair: [number, string],
    ) => {
        selectAtomOption(
            optionKeyValuePair,
            secondClauseAtomIndex,
            firstClauseAtomIndex,
            setSecondClauseAtomIndex,
            false,
        );
    };

    /**
     * FO Resolution: Submit a custom resolve move containing variable assignment rules
     * @param {boolean} autoAssign - Automatically assign variables if this is set to true
     * @param {VarAssign} varAssign - Variable assignments by the user
     * @returns {void | Error} - Error if the two nodes for the close move can't be identified
     */
    const sendFOResolve = (autoAssign: boolean, varAssign: VarAssign = {}) => {
        setShowVarAssignDialog(false);
        if (
            !selectedClauses ||
            selectedClauses.length !== 2 ||
            !instanceOfFOResState(state, calculus)
        ) {
            return;
        }
        if (autoAssign) {
            sendResolveUnify(
                selectedClauses[0],
                selectedClauses[1],
                firstClauseAtomIndex!,
                secondClauseAtomIndex!,
                { ...apiInfo, state },
            );
        } else {
            sendResolveCustom(
                selectedClauses[0],
                selectedClauses[1],
                firstClauseAtomIndex!,
                secondClauseAtomIndex!,
                varAssign,
                { ...apiInfo, state },
            );
        }
        onCloseAtomDialog();
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
        <Fragment>
            <Dialog
                open={showDialog}
                label="Choose one atom of each clause to resolve them"
                onClose={onCloseAtomDialog}
            >
                <h3>1. Clause</h3>
                <OptionList
                    options={foAtomOptions()[0]}
                    selectedOptionIds={
                        firstClauseAtomIndex !== undefined
                            ? [firstClauseAtomIndex]
                            : undefined
                    }
                    selectOptionCallback={selectFirstClauseAtomOption}
                />
                <h3>2. Clause</h3>
                <OptionList
                    options={foAtomOptions()[1]}
                    selectedOptionIds={
                        secondClauseAtomIndex !== undefined
                            ? [secondClauseAtomIndex]
                            : undefined
                    }
                    selectOptionCallback={selectSecondClauseAtomOption}
                />
            </Dialog>

            <VarAssignDialog
                open={showVarAssignDialog}
                onClose={() => setShowVarAssignDialog(false)}
                varOrigins={varOrigins}
                vars={varsToAssign}
                submitVarAssignCallback={sendFOResolve}
                secondSubmitEvent={sendFOResolve}
            />
        </Fragment>
    );
};

export default ResolutionResolveDialog;
