import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import FactorizeIcon from "../../../components/icons/factorize";
import HideIcon from "../../../components/icons/hide";
import HyperIcon from "../../../components/icons/hyper";
import SendIcon from "../../../components/icons/send";
import ShowIcon from "../../../components/icons/show";
import OptionList from "../../../components/input/option-list";
import ResolutionCircle from "../../../components/resolution/circle";
import { checkClose, sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { atomToString } from "../../../helpers/clause";
import {
    addHyperSidePremiss,
    findHyperSidePremiss,
    findOptimalMainLit,
    getCandidateClauses,
    getFOHyperCandidates,
    getHyperClauseIds,
    getPropHyperCandidates,
    hideClause,
    removeHyperSidePremiss,
    showHiddenClauses,
} from "../../../helpers/resolution";
import { Calculus, ResolutionCalculusType } from "../../../types/app";
import {
    Atom,
    CandidateClause,
    Clause,
    ClauseSet,
    FOAtom,
    getCandidateCount,
    instanceOfPropCandidateClause,
    PropCandidateClause,
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

type SelectedClauses = undefined | [number] | [number, number];

const ResolutionView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
        onError,
        onChange,
        onSuccess,
        smallScreen,
    } = useAppState();

    let state = cState;
    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state =
            calculus === Calculus.propResolution
                ? propExample
                : calculus === Calculus.foResolution
                ? foExample
                : undefined;
        onChange(calculus, state);
    }
    const apiInfo = { onChange, onError, server };

    const [hyperRes, setHyperRes] = useState<HyperResolutionMove | undefined>(
        undefined,
    );

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );
    const [showFactorizeDialog, setShowFactorizeDialog] = useState(false);
    const [selectedFactorizeOption, setSelectedFactorizeOption] = useState<
        number | undefined
    >(undefined);
    const [selectedClauseAtomOption, setSelectedClauseAtomOption] = useState<
        number | undefined
    >(undefined);
    const [candidateClauseAtomOption, setCandidateClauseAtomOption] = useState<
        number | undefined
    >(undefined);

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const selectedClauseAtomsLengthEqual = (length: number) =>
        selectedClauseId === undefined
            ? false
            : state!.clauseSet.clauses[selectedClauseId].atoms.length ===
              length;

    const selectedClauseAtomsLengthGreater = (length: number) =>
        selectedClauseId === undefined
            ? false
            : state!.clauseSet.clauses[selectedClauseId].atoms.length > length;

    const showResolveDialog = selectedClauses && selectedClauses.length === 2;

    const candidateClauses: CandidateClause[] = getCandidateClauses(
        state!.clauseSet,
        state!.visualHelp,
        calculus,
        selectedClauseId,
    );

    /**
     * Get a candidate clause matching the index property
     * @param {number} searchIndex - The index to search for
     * @returns {CandidateClause | null} - The candidate clause matching the index
     */
    const getCandidateClause = (searchIndex: number) => {
        const candidateClauseHits = candidateClauses.filter(
            (c) => c.index === searchIndex,
        );
        if (candidateClauseHits.length === 1) {
            return candidateClauseHits[0];
        }
        return null;
    };

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
            const candidateClause = getCandidateClause(newClauseId);
            if (candidateClause != null) {
                const candidateAtomCount = getCandidateCount(candidateClause!);
                if (candidateAtomCount === 0) {
                    onError("These clauses can't be resolved.");
                } else if (
                    instanceOfPropCandidateClause(candidateClause, calculus)
                ) {
                    const options = literalOptions(candidateClause);
                    if (options.length === 1) {
                        // Send resolve move to backend
                        sendMove(
                            server,
                            calculus,
                            state!,
                            {
                                type: "res-resolve",
                                c1: selectedClauseId,
                                c2: newClauseId,
                                literal: options[0],
                            },
                            onChange,
                            onError,
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
                    // Send resolve move to backend
                    sendMove(
                        server,
                        calculus,
                        state!,
                        {
                            type: "res-resolveunify",
                            c1: selectedClauseId,
                            c2: newClauseId,
                            l1: selectedClauseAtomIndex,
                            l2: resolventAtomIndex,
                        },
                        onChange,
                        onError,
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
     * @returns {string[]} - The literal options
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
                            options.push(newOption);
                        }
                    }),
            );
        }

        return options;
    };

    console.log(hyperRes);

    /**
     * Handler for the selection of a literal option in the propositional resolve dialog
     * @param {number} optionIndex - The option's index which was selected
     * @returns {void}
     */
    const selectLiteralOption = (optionIndex: number) => {
        if (selectedClauses && selectedClauses.length === 2) {
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
                            ] as Clause).atoms[optionIndex].lit,
                        ),
                        selectedClauses[1],
                        optionIndex,
                    ),
                );
                setSelectedClauses([selectedClauses[0]]);
                return;
            }
            sendMove(
                server,
                calculus,
                state!,
                {
                    type: "res-resolve",
                    c1: selectedClauses[0],
                    c2: selectedClauses[1],
                    literal: literalOptions()[optionIndex],
                },
                onChange,
                onError,
            );
        }
        setSelectedClauses(undefined);
    };

    /**
     * Get atom options for the FO resolve move
     * @returns {[][]} - The relevant atom options with options[0] containing selectedClause's atoms
     *                   and options[1] containing candidateClause's atoms
     */
    const atomOptions = () => {
        const options: string[][] = [[], []];
        if (selectedClauses && selectedClauses.length === 2) {
            const candidateClause = getCandidateClause(selectedClauses[1]);
            if (candidateClause != null) {
                let allCandidateClauseAtomIndices: number[] = [];
                candidateClause.candidateAtomMap.forEach(
                    (
                        candidateClauseAtomIndices: number[],
                        selectedClauseAtomIndex: number,
                    ) => {
                        options[0][selectedClauseAtomIndex] = atomToString(
                            state!.clauseSet.clauses[selectedClauses[0]].atoms[
                                selectedClauseAtomIndex
                            ],
                        );
                        allCandidateClauseAtomIndices = allCandidateClauseAtomIndices.concat(
                            candidateClauseAtomIndices,
                        );
                    },
                );
                const uniqueCandidateClauseAtomIndices = Array.from(
                    new Set(allCandidateClauseAtomIndices),
                );
                uniqueCandidateClauseAtomIndices.forEach(
                    (candidateClauseAtomIndex: number) => {
                        options[1][candidateClauseAtomIndex] = atomToString(
                            state!.clauseSet.clauses[selectedClauses[1]].atoms[
                                candidateClauseAtomIndex
                            ],
                        );
                    },
                );
            }
        }
        return options;
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (selectedClause's atoms section)
     * @param {number} optionIndex - The option's index which was selected
     * @returns {void}
     */
    const selectSelectedClauseAtomOption = (optionIndex: number) => {
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (selectedClauseAtomOption === optionIndex) {
            setSelectedClauseAtomOption(undefined);
        } else if (candidateClauseAtomOption === undefined) {
            setSelectedClauseAtomOption(optionIndex);
        } else if (hyperRes) {
            setHyperRes(
                addHyperSidePremiss(
                    hyperRes,
                    optionIndex,
                    selectedClauses[1],
                    candidateClauseAtomOption,
                ),
            );
            onCloseAtomDialog();
        } else {
            sendMove(
                server,
                calculus,
                state!,
                {
                    type: "res-resolveunify",
                    c1: selectedClauses[0],
                    c2: selectedClauses[1],
                    l1: optionIndex,
                    l2: candidateClauseAtomOption,
                },
                onChange,
                onError,
            );
            onCloseAtomDialog();
        }
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (candidateClause's atoms section)
     * @param {number} optionIndex - The option's index which was selected
     * @returns {void}
     */
    const selectCandidateAtomOption = (optionIndex: number) => {
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (candidateClauseAtomOption === optionIndex) {
            setCandidateClauseAtomOption(undefined);
        } else if (selectedClauseAtomOption === undefined) {
            setCandidateClauseAtomOption(optionIndex);
        } else if (hyperRes) {
            setHyperRes(
                addHyperSidePremiss(
                    hyperRes,
                    selectedClauseAtomOption,
                    selectedClauses[1],
                    optionIndex,
                ),
            );
            onCloseAtomDialog();
        } else {
            sendMove(
                server,
                calculus,
                state!,
                {
                    type: "res-resolveunify",
                    c1: selectedClauses[0],
                    c2: selectedClauses[1],
                    l1: selectedClauseAtomOption,
                    l2: optionIndex,
                },
                onChange,
                onError,
            );
            onCloseAtomDialog();
        }
    };

    /**
     * Handler for the closure of the FO resolve dialog
     * @returns {void}
     */
    const onCloseAtomDialog = () => {
        setCandidateClauseAtomOption(undefined);
        setSelectedClauseAtomOption(undefined);
        if (!hyperRes) { setSelectedClauses(undefined); }
        else { setSelectedClauses(selectedClauses && [selectedClauses[0]]); }
    };

    /**
     * Get factorize options for the factorize dialog
     * @returns {string[]} - The factorize options
     */
    const factorizeOptions = () => {
        let options: string[] = [];
        if (state !== undefined && selectedClauseId !== undefined) {
            if (instanceOfPropResState(state, calculus)) {
                options = state.clauseSet.clauses[
                    selectedClauseId
                ].atoms.map((atom: Atom) => atomToString(atom));
            } else if (instanceOfFOResState(state, calculus)) {
                options = state.clauseSet.clauses[
                    selectedClauseId
                ].atoms.map((atom: FOAtom) => atomToString(atom));
            }
        }
        return options;
    };

    /**
     * Handler for the selection of an factorizeOption in the FO factorize dialog
     * @param {number} optionIndex - The option's index which was selected
     * @returns {void}
     */
    const selectFactorizeOption = (optionIndex: number) => {
        if (selectedFactorizeOption === undefined) {
            setSelectedFactorizeOption(optionIndex);
        } else if (optionIndex === selectedFactorizeOption) {
            // Same option was selected again -> deselect it
            setSelectedFactorizeOption(undefined);
        } else {
            sendMove(
                server,
                calculus,
                state!,
                {
                    type: "res-factorize",
                    c1: selectedClauseId!,
                    a1: selectedFactorizeOption,
                    a2: optionIndex,
                },
                onChange,
                onError,
            );
            setShowFactorizeDialog(false);
            setSelectedFactorizeOption(undefined);
            setSelectedClauses(undefined);
        }
    };

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
            />
            <ControlFAB alwaysOpen={!smallScreen}>
                {selectedClauseId !== undefined ? (
                    <Fragment>
                        <FAB
                            mini={true}
                            extended={true}
                            label="Hyper Resolution"
                            showIconAtEnd={true}
                            icon={
                                <HyperIcon
                                    fill={hyperRes ? "#000" : undefined}
                                />
                            }
                            active={!!hyperRes}
                            onClick={() => {
                                if (hyperRes) {
                                    setHyperRes(undefined);
                                    return;
                                }
                                setHyperRes({
                                    type: "res-hyper",
                                    mainID: selectedClauseId,
                                    atomMap: {},
                                });
                            }}
                        />
                        <FAB
                            mini={true}
                            extended={true}
                            label="Hide clause"
                            showIconAtEnd={true}
                            icon={<HideIcon />}
                            onClick={() => {
                                hideClause(selectedClauseId, calculus, {
                                    ...apiInfo,
                                    state,
                                });
                                setSelectedClauses(undefined);
                            }}
                        />

                        {selectedClauseAtomsLengthGreater(0) ? (
                            <FAB
                                mini={true}
                                extended={true}
                                label="Factorize"
                                showIconAtEnd={true}
                                icon={<FactorizeIcon />}
                                onClick={() => {
                                    if (
                                        instanceOfPropResState(state, calculus)
                                    ) {
                                        sendMove(
                                            server,
                                            calculus,
                                            state!,
                                            {
                                                type: "res-factorize",
                                                c1: selectedClauseId,
                                            },
                                            onChange,
                                            onError,
                                        );
                                        setSelectedClauses(undefined);
                                    } else if (
                                        selectedClauseAtomsLengthEqual(2)
                                    ) {
                                        sendMove(
                                            server,
                                            calculus,
                                            state!,
                                            {
                                                type: "res-factorize",
                                                c1: selectedClauseId,
                                                a1: 0,
                                                a2: 1,
                                            },
                                            onChange,
                                            onError,
                                        );
                                        setSelectedClauses(undefined);
                                    } else {
                                        setShowFactorizeDialog(true);
                                    }
                                }}
                            />
                        ) : (
                            undefined
                        )}
                    </Fragment>
                ) : (
                    undefined
                )}
                {state!.hiddenClauses.clauses.length > 0 ? (
                    <FAB
                        mini={true}
                        extended={true}
                        label="Show all"
                        showIconAtEnd={true}
                        icon={<ShowIcon />}
                        onClick={() => {
                            showHiddenClauses(calculus, {
                                ...apiInfo,
                                state,
                            });
                            setSelectedClauses(undefined);
                        }}
                    />
                ) : (
                    undefined
                )}
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
                        checkClose(server, onError, onSuccess, calculus, state)
                    }
                />
            </ControlFAB>
            {instanceOfPropResState(state, calculus) ? (
                <Dialog
                    open={showResolveDialog}
                    label="Choose a literal to resolve"
                    onClose={() => setSelectedClauses([selectedClauses![0]])}
                >
                    <OptionList
                        options={literalOptions()}
                        selectOptionCallback={selectLiteralOption}
                    />
                </Dialog>
            ) : instanceOfFOResState(state, calculus) ? (
                <Dialog
                    open={showResolveDialog}
                    label="Choose 2 atoms to resolve"
                    onClose={onCloseAtomDialog}
                >
                    <OptionList
                        options={atomOptions()[0]}
                        selectedOptionId={selectedClauseAtomOption}
                        selectOptionCallback={selectSelectedClauseAtomOption}
                    />
                    <hr />
                    <OptionList
                        options={atomOptions()[1]}
                        selectedOptionId={candidateClauseAtomOption}
                        selectOptionCallback={selectCandidateAtomOption}
                    />
                </Dialog>
            ) : (
                undefined
            )}
            <Dialog
                open={showFactorizeDialog}
                label="Choose 2 atoms to factorize"
                onClose={() => {
                    setShowFactorizeDialog(false);
                    setSelectedFactorizeOption(undefined);
                }}
            >
                <OptionList
                    options={factorizeOptions()}
                    selectedOptionId={selectedFactorizeOption}
                    selectOptionCallback={selectFactorizeOption}
                />
            </Dialog>
            {hyperRes && hyperRes.atomMap && (
                <FAB
                    class={style.hyperFab}
                    label="Send"
                    icon={<SendIcon />}
                    extended={true}
                    mini={true}
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
        </Fragment>
    );
};

export default ResolutionView;
