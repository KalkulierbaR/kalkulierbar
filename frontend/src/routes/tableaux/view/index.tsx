import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { TableauxCalculus } from "../../../types/app";
import {
    instanceOfFoTableauxState,
    instanceOfPropTableauxState,
    SelectNodeOptions,
    TableauxTreeLayoutNode,
    VarAssign
} from "../../../types/tableaux";
import * as style from "./style.scss";

import CheckCloseBtn from "../../../components/check-close";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import AddIcon from "../../../components/icons/add";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import ExploreIcon from "../../../components/icons/explore";
import UndoIcon from "../../../components/icons/undo";
import OptionList from "../../../components/input/option-list";
import VarAssignList from "../../../components/input/var-assign-list";
import TableauxTreeView from "../../../components/tableaux/tree";
import { checkClose } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { clauseSetToStringArray } from "../../../helpers/clause";
import {
    nextOpenLeaf,
    sendBacktrack,
    sendClose,
    sendExtend
} from "../../../helpers/tableaux";
import { FoArgument, FoArgumentType } from "../../../types/clause";
import foExampleState from "./fo-example";
import propExampleState from "./prop-example";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculus;
}

const TableauxView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
        smallScreen,
        onError,
        onChange,
        onSuccess
    } = useAppState();
    let state = cState;
    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined
    );
    const [closeMoveSecondNodeId, setCloseMoveSecondNodeId] = useState<
        number | undefined
    >(undefined);
    const [showClauseDialog, setShowClauseDialog] = useState(false);
    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);
    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);

    const clauseOptions = () => {
        let options: string[] = [];
        if (
            calculus === "prop-tableaux" &&
            instanceOfPropTableauxState(state)
        ) {
            options = clauseSetToStringArray(state!.clauseSet);
        }
        if (calculus === "fo-tableaux" && instanceOfFoTableauxState(state)) {
            options = state!.renderedClauseSet;
        }
        return options;
    };

    /**
     * The function to call, when the user selects a clause
     * @param {number} newClauseId - The id of the clause, which was clicked on
     * @returns {void}
     */
    const selectClauseCallback = (newClauseId: number) => {
        if (newClauseId === selectedClauseId) {
            // The same clause was selected again => deselect it
            setSelectedClauseId(undefined);
            setSelectedNodeId(undefined);
        } else if (selectedNodeId !== undefined) {
            // The clause and node have been selected => send extend move request to backend
            sendExtend(
                calculus,
                server,
                state!,
                onChange,
                onError,
                selectedNodeId,
                newClauseId
            );
            setSelectedNodeId(undefined);
            setSelectedClauseId(undefined);
        } else {
            setSelectedClauseId(newClauseId);
        }
    };

    /**
     * The function to call, when the user selects a node
     * @param {TableauxTreeLayoutNode} newNode - The node which was clicked on
     * @param {boolean} ignoreClause - Whether to ignore the clause if one is selected
     * @returns {void}
     */
    const selectNodeCallback = (
        newNode: TableauxTreeLayoutNode,
        { ignoreClause = false }: SelectNodeOptions = {}
    ) => {
        const newNodeIsLeaf = newNode.children.length === 0;

        if (newNode.id === selectedNodeId) {
            // The same node was selected again => deselect it
            setSelectedNodeId(undefined);
        } else if (selectedNodeId === undefined) {
            setSelectedNodeId(newNode.id);
            if (ignoreClause) {
                setSelectedClauseId(undefined);
            } else if (selectedClauseId !== undefined && newNodeIsLeaf) {
                // The clause and node have been selected => send extend move request to backend
                sendExtend(
                    calculus,
                    server,
                    state!,
                    onChange,
                    onError,
                    newNode.id,
                    selectedClauseId
                );
                setSelectedNodeId(undefined);
                setSelectedClauseId(undefined);
            }
        } else {
            const selectedNode = state!.nodes[selectedNodeId];
            const selectedNodeIsLeaf = selectedNode.children.length === 0;

            if (
                (selectedNodeIsLeaf && newNodeIsLeaf) ||
                (!selectedNodeIsLeaf && !newNodeIsLeaf)
            ) {
                setSelectedNodeId(newNode.id);
            } else if (calculus === "prop-tableaux") {
                // Now we have a leaf and a predecessor => Try close move
                // If we can't do it, let server handle it
                sendClose(
                    calculus,
                    server,
                    state!,
                    onChange,
                    onError,
                    newNodeIsLeaf ? newNode.id : selectedNodeId,
                    newNodeIsLeaf ? selectedNodeId : newNode.id
                );
                setSelectedNodeId(undefined);
            } else if (
                calculus === "fo-tableaux" &&
                instanceOfFoTableauxState(state)
            ) {
                // Prepare dialog for automatic/manual unification
                setCloseMoveSecondNodeId(newNode.id);
                const vars: string[] = [];
                const checkArgumentForVar = (argument: FoArgument) => {
                    if (argument.type === FoArgumentType.quantifiedVariable) {
                        vars.push(argument.spelling);
                    }
                };
                selectedNode.relation!.arguments.forEach(checkArgumentForVar);
                newNode.relation!.arguments.forEach(checkArgumentForVar);
                if (vars.length <= 0) {
                    submitVarAssign(true);
                }
                setVarsToAssign(vars);
                setShowVarAssignDialog(true);
            }
        }
    };

    const submitVarAssign = (autoClose: boolean, varAssign: VarAssign = {}) => {
        setShowVarAssignDialog(false);
        if (
            selectedNodeId === undefined ||
            closeMoveSecondNodeId === undefined
        ) {
            throw new Error(
                "Close move went wrong, since selected nodes could not be identified."
            );
        }
        const selectedNode = state!.nodes[selectedNodeId];
        const leafNodeId =
            selectedNode.children.length === 0
                ? selectedNodeId
                : closeMoveSecondNodeId;
        const predNodeId =
            selectedNode.children.length === 0
                ? closeMoveSecondNodeId
                : selectedNodeId;
        sendClose(
            calculus,
            server,
            state!,
            onChange,
            onError,
            leafNodeId,
            predNodeId,
            varAssign,
            autoClose
        );
        setSelectedNodeId(undefined);
        setCloseMoveSecondNodeId(undefined);
    };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        switch (calculus) {
            case "prop-tableaux":
                state = propExampleState;
                break;
            case "fo-tableaux":
                state = foExampleState;
                break;
        }
        onChange(calculus, state);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle Crtl+z
            if (!e.ctrlKey || e.shiftKey || e.metaKey || e.keyCode !== 90) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            sendBacktrack(calculus, server, state!, onChange, onError);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [state, server, onChange, onError]);

    return (
        <Fragment>
            <h2>Tableaux View</h2>

            <div class={style.view}>
                {!smallScreen && (
                    <div>
                        <OptionList
                            options={clauseOptions()}
                            selectedOptionId={selectedClauseId}
                            selectOptionCallback={selectClauseCallback}
                        />
                        <CheckCloseBtn calculus={calculus} />
                    </div>
                )}

                <TableauxTreeView
                    nodes={state!.nodes}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectNodeCallback={selectNodeCallback}
                />
            </div>

            <Dialog
                open={showClauseDialog}
                label="Choose Clause"
                onClose={() => setShowClauseDialog(false)}
            >
                <OptionList
                    options={clauseOptions()}
                    selectedOptionId={undefined}
                    selectOptionCallback={(id: number) => {
                        setShowClauseDialog(false);
                        selectClauseCallback(id);
                    }}
                />
            </Dialog>

            {calculus === "fo-tableaux" && instanceOfFoTableauxState(state) ? (
                <Dialog
                    open={showVarAssignDialog}
                    label="Choose variable assignments or leave them blank"
                    onClose={() => setShowVarAssignDialog(false)}
                >
                    <VarAssignList
                        vars={varsToAssign}
                        manualVarAssign={state.manualVarAssign}
                        submitVarAssignCallback={submitVarAssign}
                        submitLabel="Assign variables"
                        secondSubmitEvent={submitVarAssign}
                        secondSubmitLabel="Automatic assignment"
                    />
                </Dialog>
            ) : (
                undefined
            )}

            <ControlFAB>
                {selectedNodeId === undefined ? (
                    <Fragment>
                        {state.nodes.filter(node => !node.isClosed).length >
                        0 ? (
                            <FAB
                                icon={<ExploreIcon />}
                                label="Next Leaf"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    const node = nextOpenLeaf(state!.nodes);
                                    if (node === undefined) {
                                        return;
                                    }
                                    dispatchEvent(
                                        new CustomEvent("go-to", {
                                            detail: { node }
                                        })
                                    );
                                }}
                            />
                        ) : (
                            undefined
                        )}
                        <FAB
                            icon={<CenterIcon />}
                            label="Center"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                dispatchEvent(new CustomEvent("center"));
                            }}
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
                                    state
                                )
                            }
                        />
                        {state.backtracking ? (
                            <FAB
                                icon={<UndoIcon />}
                                label="Undo"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    sendBacktrack(
                                        calculus,
                                        server,
                                        state!,
                                        onChange,
                                        onError
                                    );
                                }}
                            />
                        ) : (
                            undefined
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        <FAB
                            icon={<CenterIcon />}
                            label="Center"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                dispatchEvent(new CustomEvent("center"));
                            }}
                        />
                        <FAB
                            icon={<AddIcon />}
                            label="Expand"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                setShowClauseDialog(!showClauseDialog);
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default TableauxView;
