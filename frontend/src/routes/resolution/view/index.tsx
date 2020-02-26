import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import Btn from "../../../components/btn";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import SendIcon from "../../../components/icons/send";
import OptionList from "../../../components/input/option-list";
import ResolutionCircle from "../../../components/resolution/circle";
import ResolutionFAB from "../../../components/resolution/fab";
import { sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import {stringArrayToStringMap} from "../../../helpers/array-to-map";
import { atomToString } from "../../../helpers/clause";
import {
    addHyperSidePremiss,
    findHyperSidePremiss,
    findOptimalMainLit,
    getCandidateClauses,
    getFOHyperCandidates,
    getHyperClauseIds,
    getPropHyperCandidates,
    getSelectable,
    hideClause,
    removeHyperSidePremiss, sendFactorize, showHiddenClauses,
} from "../../../helpers/resolution";
import { Calculus, ResolutionCalculusType } from "../../../types/app";
import {
    Atom,
    CandidateClause,
    Clause,
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
        smallScreen,
    } = useAppState();
    const apiInfo = { onChange, onError, server };

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

    const [hyperRes, setHyperRes] = useState<HyperResolutionMove | undefined>(
        undefined,
    );

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const [showFactorizeDialog, setShowFactorizeDialog] = useState(false);
    const [factorizeAtomIndices, setFactorizeAtomIndices] = useState(new Set<number>());

    const [selectedClauseAtomOption, setSelectedClauseAtomOption] = useState<
        number | undefined
    >(undefined);
    const [candidateClauseAtomOption, setCandidateClauseAtomOption] = useState<
        number | undefined
    >(undefined);

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const showResolveDialog = selectedClauses && selectedClauses.length === 2;

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
                const candidateAtomCount = getCandidateCount(candidateClause);
                if (candidateAtomCount === 0) {
                    onError("These clauses can't be resolved.");
                } else if (
                    instanceOfPropCandidateClause(candidateClause, calculus)
                ) {
                    const options = literalOptions(candidateClause);
                    if (options.size === 1) {
                        // Send resolve move to backend
                        sendMove(
                            server,
                            calculus,
                            state!,
                            {
                                type: "res-resolve",
                                c1: selectedClauseId,
                                c2: newClauseId,
                                literal: options.entries().next().value[1],
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

    console.log(hyperRes);

    /**
     * Handler for the selection of a literal option in the propositional resolve dialog
     * @param {[number, string]} keyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectLiteralOption = (keyValuePair: [number, string]) => {
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
                            ] as Clause).atoms[keyValuePair[0]].lit,
                        ),
                        selectedClauses[1],
                        keyValuePair[0],
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
                    literal: keyValuePair[1],
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
        const options = [new Map<number, string>(), new Map<number, string>()];
        if (selectedClauses && selectedClauses.length === 2) {
            const candidateClause = getCandidateClause(selectedClauses[1]);
            if (candidateClause != null) {
                const uniqueCandidateClauseAtomIndices = new Set<number>();
                candidateClause.candidateAtomMap.forEach(
                    (
                        candidateAtomIndices: number[],
                        selectedClauseAtomIndex: number,
                    ) => {
                        options[0].set(selectedClauseAtomIndex, atomToString(
                            state!.clauseSet.clauses[selectedClauses[0]].atoms[
                                selectedClauseAtomIndex
                            ],
                        ));
                        candidateAtomIndices.forEach(
                            candidateAtomIndex => uniqueCandidateClauseAtomIndices.add(candidateAtomIndex)
                        );
                    },
                );
                uniqueCandidateClauseAtomIndices.forEach(
                    (candidateClauseAtomIndex: number) => {
                        options[1].set(candidateClauseAtomIndex, atomToString(
                            state!.clauseSet.clauses[selectedClauses[1]].atoms[
                                candidateClauseAtomIndex
                            ],
                        ));
                    },
                );
            }
        }
        return options;
    };

    /**
     * Handler for the selection of an atomOption in the FO resolve dialog (selectedClause's atoms section)
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectSelectedClauseAtomOption = (optionKeyValuePair: [number, string]) => {
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
        } else {
            sendMove(
                server,
                calculus,
                state!,
                {
                    type: "res-resolveunify",
                    c1: selectedClauses[0],
                    c2: selectedClauses[1],
                    l1: optionKeyValuePair[0],
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
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectCandidateAtomOption = (optionKeyValuePair: [number, string]) => {
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
                    l2: atomIndex,
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
        if (!hyperRes) {
            setSelectedClauses(undefined);
        } else {
            setSelectedClauses(selectedClauses && [selectedClauses[0]]);
        }
    };

    /**
     * Get factorize options for the factorize dialog
     * @returns {Map<string,number>} - The factorize options
     */
    const factorizeOptions = () => {
        let options = new Map<number, string>();
        if (state !== undefined && selectedClauseId !== undefined) {
            if (instanceOfPropResState(state, calculus)) {
                options = stringArrayToStringMap(
                    state.clauseSet.clauses[selectedClauseId].atoms.map(
                        (atom: Atom) => atomToString(atom)
                    )
                );
            } else if (instanceOfFOResState(state, calculus)) {
                options = stringArrayToStringMap(
                    state.clauseSet.clauses[selectedClauseId].atoms.map(
                        (atom: FOAtom) => atomToString(atom)
                    )
                );
            }
        }
        return options;
    };

    /**
     * Handler for the selection of an factorizeOption in the FO factorize dialog
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectFactorizeOption = (optionKeyValuePair: [number, string]) => {
        const atomIndex = optionKeyValuePair[0];

        const newSet = new Set(factorizeAtomIndices);
        if (newSet.has(atomIndex)) {
            // Same option was selected again -> deselect it
            newSet.delete(atomIndex);
        } else {
            newSet.add(atomIndex);
        }
        setFactorizeAtomIndices(newSet);
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
                        selectedOptionIds={selectedClauseAtomOption !== undefined ?
                            [selectedClauseAtomOption] : undefined
                        }
                        selectOptionCallback={selectSelectedClauseAtomOption}
                    />
                    <hr />
                    <OptionList
                        options={atomOptions()[1]}
                        selectedOptionIds={candidateClauseAtomOption !== undefined ?
                            [candidateClauseAtomOption] : undefined
                        }
                        selectOptionCallback={selectCandidateAtomOption}
                    />
                </Dialog>
            ) : undefined}
            
            <ResolutionFAB 
                calculus={calculus} 
                state={state!} 
                selectedClauseId={selectedClauseId}
                hyperRes={hyperRes}
                hyperResCallback={() => {
                    hideClause(selectedClauseId!, calculus, {
                        ...apiInfo,
                        state,
                    });
                    setSelectedClauses(undefined);}
                }
                hideCallback={() => {
                        hideClause(selectedClauseId!, calculus, {
                            ...apiInfo,
                            state,
                        });
                        setSelectedClauses(undefined);
                    }
                }
                showCallback={() => {
                    showHiddenClauses(calculus, {
                        ...apiInfo,
                        state,
                    });
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

            <Dialog
                open={showFactorizeDialog}
                label="Choose atoms to factorize"
                onClose={() => {
                    setShowFactorizeDialog(false);
                    factorizeAtomIndices.clear();
                }}
            >
                <OptionList
                    options={factorizeOptions()}
                    selectedOptionIds={Array.from(factorizeAtomIndices)}
                    selectOptionCallback={selectFactorizeOption}
                />
                <Btn
                    onClick={() => {
                        sendFactorize(
                            selectedClauseId!,
                            factorizeAtomIndices,
                            calculus,
                            {
                                ...apiInfo,
                                state,
                            },
                        );
                        setShowFactorizeDialog(false);
                        factorizeAtomIndices.clear();
                        setSelectedClauses(undefined);
                    }}
                >
                    Factorize
                </Btn>
            </Dialog>

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
        </Fragment>
    );
};

export default ResolutionView;
