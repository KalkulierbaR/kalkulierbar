import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import TutorialDialog from "../../../components/tutorial/dialog";
import VarAssignDialog from "../../../components/dialog/var-assign";
import ResolutionCircle from "../../../components/calculus/resolution/circle";
import ResolutionFactorizeDialog from "../../../components/calculus/resolution/dialog/factorize";
import ResolutionResolveDialog from "../../../components/calculus/resolution/dialog/resolve";
import ResolutionFAB from "../../../components/calculus/resolution/fab";
import ResolutionGrid from "../../../components/calculus/resolution/grid";
import { ResolutionCalculusType } from "../../../types/calculus";
import {
    CandidateClause,
    getCandidateCount,
    instanceOfPropCandidateClause,
    PropCandidateClause,
    SelectedClauses,
} from "../../../types/calculus/clause";
import {
    HyperResolutionMove,
    instanceOfFOResState,
    instanceOfPropResState,
    VisualHelp,
} from "../../../types/calculus/resolution";
import { VarAssign } from "../../../types/calculus/tableaux";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import {
    atomToString,
    checkAtomsForVars,
    getCandidateClause,
} from "../../../util/clause";
import {
    addClause,
    addHyperSidePremiss,
    findHyperSidePremiss,
    getFOHyperCandidates,
    getHyperClauseIds,
    getInitialCandidateClauses,
    getPropHyperCandidates,
    getSelectable,
    recalculateCandidateClauses,
    removeClause,
    removeHyperSidePremiss,
    replaceClause,
    sendResolve,
    sendResolveCustom,
    sendResolveUnify,
} from "../../../util/resolution";
import { route } from "preact-router";

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
        notificationHandler,
        onChange,
    } = useAppState();

    const state = cState;
    if (!state) {
        route(`/${calculus}`);
        return null;
    }

    const apiInfo = { onChange, notificationHandler, server };

    const [showGrid, setShowGrid] = useState<boolean>(false);

    const [hyperRes, setHyperRes] = useState<HyperResolutionMove | undefined>(
        undefined,
    );

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const [showFactorizeDialog, setShowFactorizeDialog] = useState(false);

    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);
    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);
    const [selectedClauseAtomIndex, setSelectedClauseAtomIndex] = useState<
        number | undefined
    >(undefined);
    const [candidateAtomIndex, setCandidateAtomIndex] = useState<
        number | undefined
    >(undefined);
    const [varAssignSecondClauseId, setVarAssignSecondClauseId] = useState<
        number | undefined
    >(undefined);

    const selectedClauseId =
        selectedClauses === undefined ? undefined : selectedClauses[0];

    const showResolveDialog =
        selectedClauses !== undefined && selectedClauses.length === 2;

    const [candidateClauses, setCandidateClauses] = useState<CandidateClause[]>(
        getInitialCandidateClauses(state.clauseSet, calculus),
    );

    useEffect(() => {
        setCandidateClauses(
            recalculateCandidateClauses(
                state!.clauseSet,
                candidateClauses,
                state!.visualHelp === VisualHelp.rearrange && !showGrid,
                calculus,
                selectedClauseId,
            ),
        );
    }, [setCandidateClauses, selectedClauseId]);

    useEffect(() => {
        const lastMove = state!.lastMove;

        if (!lastMove) {
            return;
        }

        if (
            lastMove.type === "res-hyper" ||
            lastMove.type === "res-resolve" ||
            lastMove.type === "res-resolvecustom" ||
            lastMove.type === "res-resolveunify" ||
            (lastMove.type === "res-factorize" &&
                instanceOfFOResState(state, calculus))
        ) {
            addClause(state!.clauseSet, candidateClauses, state!.newestNode);
            setCandidateClauses([...candidateClauses]);
        }
        // I have no idea, how to do this better
        if (lastMove.type === "res-show") {
            setCandidateClauses(
                getInitialCandidateClauses(state!.clauseSet, calculus),
            );
        }
        if (
            lastMove.type === "res-factorize" &&
            instanceOfPropResState(state, calculus)
        ) {
            replaceClause(
                candidateClauses,
                lastMove.c1,
                state!.clauseSet.clauses[lastMove.c1] as any,
            );
            setCandidateClauses([...candidateClauses]);
        }
        if (lastMove.type === "res-hide") {
            removeClause(candidateClauses, lastMove.c1);
            setCandidateClauses([...candidateClauses]);
        }
    }, [state.clauseSet]);

    /**
     * Moves a clause to a new pos and shifts all other clauses
     * @param {number} oldIndex - old index of the clause to move
     * @param {number} newIndex - the index to which the clause is to be moved
     * @returns {void} - nothing
     */
    const shiftCandidateClause = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) {
            return;
        }

        // Save clause to shift
        const c = candidateClauses[oldIndex];
        // Remove clause and shift accordingly
        candidateClauses.splice(oldIndex, 1);
        // Add clause to new pos and shift all items
        candidateClauses.splice(newIndex, 0, c);
        setCandidateClauses([...candidateClauses]);
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

            let candidates: [number, number][] = [];

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
            const candidateClause = getCandidateClause(
                newClauseId,
                candidateClauses,
            );
            if (candidateClause != null) {
                const candidateAtomCount = getCandidateCount(candidateClause);
                if (candidateAtomCount === 0) {
                    notificationHandler.error(
                        "These clauses can't be resolved.",
                    );
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
                            { ...apiInfo, state },
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
                    const newSelectedClauseAtomIndex = candidateClause.candidateAtomMap
                        .keys()
                        .next().value;
                    const newCandidateAtomIndex = candidateClause.candidateAtomMap
                        .values()
                        .next().value[0];

                    const atom1 =
                        state.clauseSet.clauses[selectedClauseId].atoms[
                            newSelectedClauseAtomIndex
                        ];
                    const atom2 =
                        state.clauseSet.clauses[newClauseId].atoms[
                            newCandidateAtomIndex
                        ];
                    const vars = new Set<string>();
                    checkAtomsForVars(vars, [atom1, atom2]);
                    if (vars.size > 0) {
                        setVarOrigins([
                            atomToString(atom1),
                            atomToString(atom2),
                        ]);
                        setVarsToAssign(Array.from(vars));
                        setShowVarAssignDialog(true);
                        setSelectedClauseAtomIndex(newSelectedClauseAtomIndex);
                        setCandidateAtomIndex(newCandidateAtomIndex);
                        setVarAssignSecondClauseId(newClauseId);
                        return;
                    }
                    sendResolveUnify(
                        selectedClauseId,
                        newClauseId,
                        newSelectedClauseAtomIndex,
                        newCandidateAtomIndex,
                        { ...apiInfo, state },
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

    /**
     * FO Resolution: Submit a custom resolve move containing variable assignment rules
     * @param {boolean} autoAssign - Automatically assign variables if this is set to true
     * @param {VarAssign} varAssign - Variable assignments by the user
     * @returns {void | Error} - Error if the two nodes for the close move can't be identified
     */
    const sendFOResolve = (autoAssign: boolean, varAssign: VarAssign = {}) => {
        setShowVarAssignDialog(false);
        if (
            selectedClauseId === undefined ||
            varAssignSecondClauseId === undefined ||
            !instanceOfFOResState(state, calculus)
        ) {
            return;
        }
        if (autoAssign) {
            sendResolveUnify(
                selectedClauseId,
                varAssignSecondClauseId,
                selectedClauseAtomIndex!,
                candidateAtomIndex!,
                { ...apiInfo, state },
            );
        } else {
            sendResolveCustom(
                selectedClauseId,
                varAssignSecondClauseId,
                selectedClauseAtomIndex!,
                candidateAtomIndex!,
                varAssign,
                { ...apiInfo, state },
            );
        }
        setSelectedClauses(undefined);
    };

    const selectable = getSelectable(
        candidateClauses,
        hyperRes,
        selectedClauseId,
        selectedClauseId !== undefined
            ? state.clauseSet.clauses[selectedClauseId]
            : undefined,
    );
    const semiSelected = hyperRes ? getHyperClauseIds(hyperRes) : [];

    return (
        <Fragment>
            <h2>Resolution View</h2>

            {showGrid ? (
                <ResolutionGrid
                    clauses={candidateClauses}
                    selectClauseCallback={selectClauseCallback}
                    selectedClauseId={selectedClauseId}
                    visualHelp={state.visualHelp}
                    newestNode={state.newestNode}
                    semiSelected={semiSelected}
                    selectable={selectable}
                    shiftCandidateClause={shiftCandidateClause}
                />
            ) : (
                <ResolutionCircle
                    clauses={candidateClauses}
                    selectClauseCallback={selectClauseCallback}
                    selectedClauseId={selectedClauseId}
                    visualHelp={state.visualHelp}
                    newestNode={state.newestNode}
                    semiSelected={semiSelected}
                    selectable={selectable}
                    shiftCandidateClause={shiftCandidateClause}
                />
            )}

            <ResolutionFAB
                calculus={calculus}
                state={state}
                selectedClauseId={selectedClauseId}
                setSelectedClauses={setSelectedClauses}
                hyperRes={hyperRes}
                setHyperRes={setHyperRes}
                setShowFactorizeDialog={setShowFactorizeDialog}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
            />

            <VarAssignDialog
                open={showVarAssignDialog}
                onClose={() => setShowVarAssignDialog(false)}
                varOrigins={varOrigins}
                vars={varsToAssign}
                submitVarAssignCallback={sendFOResolve}
                secondSubmitEvent={sendFOResolve}
            />

            <ResolutionResolveDialog
                showDialog={showResolveDialog}
                calculus={calculus}
                state={state}
                selectedClauses={selectedClauses}
                setSelectedClauses={setSelectedClauses}
                hyperRes={hyperRes}
                setHyperRes={setHyperRes}
                candidateClauses={candidateClauses}
                propOptions={literalOptions()}
            />

            <ResolutionFactorizeDialog
                showDialog={showFactorizeDialog}
                setShowDialog={setShowFactorizeDialog}
                calculus={calculus}
                state={state}
                selectedClauses={selectedClauses}
                setSelectedClauses={setSelectedClauses}
            />

            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default ResolutionView;
