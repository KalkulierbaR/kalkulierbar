import {Fragment, h} from "preact";
import {useState} from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import FactoriseIcon from "../../../components/icons/factorise";
import HideIcon from "../../../components/icons/hide";
import ShowIcon from "../../../components/icons/show";
import OptionList from "../../../components/input/option-list";
import ResolutionCircle from "../../../components/resolution/circle";
import {checkClose, sendMove} from "../../../helpers/api";
import {useAppState} from "../../../helpers/app-state";
import {atomToString} from "../../../helpers/clause";
import {getCandidateClauses, hideClause, showHiddenClauses,} from "../../../helpers/resolution";
import {Calculus, ResolutionCalculusType} from "../../../types/app";
import {
    Atom,
    CandidateClause,
    FOAtom,
    getCandidateCount,
    instanceOfPropCandidateClause,
    PropCandidateClause
} from "../../../types/clause";
import {instanceOfFOResState, instanceOfPropResState} from "../../../types/resolution";
import {foExample, propExample} from "./example";

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
        state = calculus === Calculus.propResolution ? propExample :
            calculus === Calculus.foResolution ? foExample :
                undefined;
        onChange(calculus, state);
    }
    const apiInfo = { onChange, onError, server };

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined
    );
    const [showFactoriseDialog, setShowFactoriseDialog] = useState(
        false
    );
    const [selectedFactorizeOption, setSelectedFactorizeOption] = useState<number|undefined>(
        undefined
    );
    const [selectedClauseAtomOption, setSelectedClauseAtomOption] = useState<number|undefined>(
        undefined
    );
    const [candidateClauseAtomOption, setCandidateClauseAtomOption] = useState<number|undefined>(
        undefined
    );

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const selectedClauseAtomsLengthEqual = (length: number) =>
        selectedClauseId === undefined ? false :
            state!.clauseSet.clauses[selectedClauseId].atoms.length === length;

    const selectedClauseAtomsLengthGreater = (length: number) =>
        selectedClauseId === undefined ? false :
            state!.clauseSet.clauses[selectedClauseId].atoms.length > length;

    const showResolveDialog = selectedClauses && selectedClauses.length === 2;

    const candidateClauses : CandidateClause[] = getCandidateClauses(
        state!.clauseSet,
        state!.visualHelp,
        calculus,
        selectedClauseId,
    );
    const getCandidateClause = (searchIndex: number) => {
        const candidateClauseHits = candidateClauses.filter(
            (c) => c.index === searchIndex
        );
        if(candidateClauseHits.length === 1){
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
        } else {
            const candidateClause = getCandidateClause(newClauseId);
            if(candidateClause != null) {
                const candidateAtomCount = getCandidateCount(candidateClause!);
                if(candidateAtomCount === 0){
                    onError("These clauses can't be resolved.");
                }
                else if (instanceOfPropCandidateClause(candidateClause, calculus)) {
                    const options = literalOptions(candidateClause);
                    if(options.length === 1) {
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
                } else if (candidateAtomCount === 1 && instanceOfFOResState(state, calculus)) {
                    const resolventAtomIndex = candidateClause.candidateAtomMap.values().next().value[0];
                    const selectedClauseAtomIndex = candidateClause.candidateAtomMap.keys().next().value;
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
                }
                else{
                    // Show dialog for literal selection
                    setSelectedClauses([selectedClauses![0], newClauseId]);
                    return;
                }
                // Reset selection
                setSelectedClauses(undefined);
            }
            else {
                throw new Error("Candidate clause could not be identified with newClauseId"); // Debug error
            }
        }
    };

    const literalOptions = (candidateClause?: PropCandidateClause) => {
        const options: string[] = [];
        if (candidateClause === undefined && selectedClauses && selectedClauses.length === 2) {
            const newCandidateClause = candidateClauses[selectedClauses[1]];
            if (instanceOfPropCandidateClause(newCandidateClause, calculus)){
                candidateClause = newCandidateClause;
            }
        }
        if(candidateClause !== undefined){
            candidateClause.candidateAtomMap.forEach((selectedClauseAtomIndices) =>
                selectedClauseAtomIndices.forEach((atomIndex) => {
                    const newOption: string = candidateClause!.clause.atoms[atomIndex].lit;
                    if (!options.includes(newOption)){
                        options.push(newOption);
                    }
                })
            );
        }
        return options;
    };

    const selectLiteralOption = (optionIndex: number) => {
        if(selectedClauses && selectedClauses.length === 2) {
            if (instanceOfPropResState(state, calculus)) {
                sendMove(
                    server,
                    calculus,
                    state!,
                    {
                        type: "res-resolve",
                        c1: selectedClauseId!,
                        c2: selectedClauses[1],
                        literal: literalOptions()[optionIndex],
                    },
                    onChange,
                    onError,
                );
            } else if (instanceOfFOResState(state, calculus)) {
                // TODO rework to send correct atom ids
                sendMove(
                    server,
                    calculus,
                    state!,
                    {
                        type: "res-resolveunify",
                        c1: selectedClauseId!,
                        c2: selectedClauses[1],
                        l1: optionIndex,
                        l2: candidateClauses[selectedClauses[1]].index,
                    },
                    onChange,
                    onError,
                );
            }
        }
        setSelectedClauses(undefined);
    };

    const atomOptions = () => {
        const options: string[][] = [[],[]];
        if (selectedClauses && selectedClauses.length === 2) {
            const candidateClause = getCandidateClause(selectedClauses[1]);
            if(candidateClause != null) {
                let allCandidateClauseAtomIndices: number[] = [];
                candidateClause.candidateAtomMap.forEach((candidateClauseAtomIndices: number[], selectedClauseAtomIndex: number) => {
                    options[0][selectedClauseAtomIndex] = atomToString(
                        state!.clauseSet.clauses[selectedClauses[0]].atoms[selectedClauseAtomIndex]
                    );
                    allCandidateClauseAtomIndices = allCandidateClauseAtomIndices.concat(candidateClauseAtomIndices);
                });
                const uniqueCandidateClauseAtomIndices = Array.from(new Set(allCandidateClauseAtomIndices));
                uniqueCandidateClauseAtomIndices.forEach((candidateClauseAtomIndex: number) => {
                    options[1][candidateClauseAtomIndex] = atomToString(
                        state!.clauseSet.clauses[selectedClauses[1]].atoms[candidateClauseAtomIndex]
                    );
                });
            }
        }
        return options;
    };

    const selectSelectedClauseAtomOption = (optionIndex: number) => {
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (selectedClauseAtomOption === optionIndex) {
            setSelectedClauseAtomOption(undefined);
        } else if (candidateClauseAtomOption === undefined) {
            setSelectedClauseAtomOption(optionIndex);
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

    const selectCandidateAtomOption = (optionIndex: number) => {
        if (!selectedClauses || selectedClauses.length !== 2) {
            return;
        }
        if (candidateClauseAtomOption === optionIndex) {
            setCandidateClauseAtomOption(undefined);
        } else if (selectedClauseAtomOption === undefined) {
            setCandidateClauseAtomOption(optionIndex);
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

    const onCloseAtomDialog = () => {
        setCandidateClauseAtomOption(undefined);
        setSelectedClauseAtomOption(undefined);
        setSelectedClauses(undefined);
    };

    const factorizeOptions = () => {
        let options: string[] = [];
        if(state !== undefined && selectedClauseId !== undefined) {
            if (instanceOfPropResState(state, calculus)) {
                options = state.clauseSet.clauses[selectedClauseId].atoms.map((atom: Atom) => atomToString(atom));
            } else if (instanceOfFOResState(state, calculus)) {
                options = state.clauseSet.clauses[selectedClauseId].atoms.map((atom: FOAtom) => atomToString(atom));
            }
        }
        return options;
    };

    const selectFactorizeOption = (optionIndex: number) => {
        if(selectedFactorizeOption === undefined){
            setSelectedFactorizeOption(optionIndex);
        }
        else if(optionIndex === selectedFactorizeOption){
            // Same option was selected again -> deselect it
            setSelectedFactorizeOption(undefined);
        }
        else {
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
            setShowFactoriseDialog(false);
            setSelectedFactorizeOption(undefined);
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
                visualHelp={state!.visualHelp}
                newestNode={state!.newestNode}
            />
            <ControlFAB alwaysOpen={!smallScreen}>
                {selectedClauseId !== undefined ?
                    <Fragment>
                        <FAB
                            mini={true}
                            extended={true}
                            label="Hide clause"
                            showIconAtEnd={true}
                            icon={<HideIcon />}
                            onClick={() => {
                                hideClause(
                                    selectedClauseId,
                                    calculus,
                                    {
                                        ...apiInfo,
                                        state,
                                    },
                                );
                                setSelectedClauses(undefined);
                            }}
                        />
                        {selectedClauseAtomsLengthGreater(0) ?
                            <FAB
                                mini={true}
                                extended={true}
                                label="Factorize"
                                showIconAtEnd={true}
                                icon={<FactoriseIcon />}
                                onClick={() => {
                                    if (instanceOfPropResState(state, calculus)){
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
                                    }
                                    else if (selectedClauseAtomsLengthEqual(2)) {
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
                                    }
                                    else{
                                        setShowFactoriseDialog(true);
                                    }
                                }}
                            />
                        : undefined}
                    </Fragment>
                : undefined }
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
                ) : undefined}
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
                        calculus,
                        state,
                        )
                    }
                />
            </ControlFAB>
            {instanceOfPropResState(state, calculus) ?
                <Dialog
                    open={showResolveDialog}
                    label="Choose a literal to resolve"
                    onClose={() => setSelectedClauses([selectedClauses![0]])}
                >
                    <OptionList
                        options={literalOptions()}
                        selectOptionCallback={selectLiteralOption}
                    />
                </Dialog> :
                instanceOfFOResState(state, calculus) ?
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
                        <hr/>
                        <OptionList
                            options={atomOptions()[1]}
                            selectedOptionId={candidateClauseAtomOption}
                            selectOptionCallback={selectCandidateAtomOption}
                        />
                    </Dialog> :
                    undefined
            }
            <Dialog
                open={showFactoriseDialog}
                label="Choose 2 atoms to factorize"
                onClose={() => {
                    setShowFactoriseDialog(false);
                    setSelectedFactorizeOption(undefined);
                }}
            >
                <OptionList
                    options={factorizeOptions()}
                    selectedOptionId={selectedFactorizeOption}
                    selectOptionCallback={selectFactorizeOption}
                />
            </Dialog>
        </Fragment>
    );
};

export default ResolutionView;