import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useState } from "preact/hooks";

import SequentFAB from "../../../components/calculus/sequent/fab";
import SequentTreeView from "../../../components/calculus/sequent/tree";
import Dialog from "../../../components/dialog";
import SaveStatsDialog from "../../../components/dialog/save-stats-dialog";
import VarAssignDialog from "../../../components/dialog/var-assign";
import OptionList from "../../../components/input/option-list";
import TutorialDialog from "../../../components/tutorial/dialog";
import { Entry } from "../../../types/app/statistics";
import { SequentCalculusType } from "../../../types/calculus";
import { getFORuleSet, getNormalRuleSet } from "../../../types/calculus/rules";
import {
    FormulaTreeLayoutNode,
    instanceOfFOSCState,
    instanceOfPSCState,
    SequentTreeLayoutNode,
    VarAssign,
} from "../../../types/calculus/sequent";
import { sendMove } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import { ruleSetToStringArray } from "../../../util/rule";
import { nodeName, parseStringToListIndex } from "../../../util/sequent";

import * as style from "./style.scss";

interface Props {
    calculus: SequentCalculusType;
}

const SequentView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    const selectedRule: string = "";

    const state = cState;
    if (!state) {
        route(`/${calculus}`);
        return null;
    }

    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined,
    );

    const [selectedListIndex, setSelectedListIndex] = useState<
        string | undefined
    >(undefined);

    const selectedNode =
        selectedNodeId !== undefined ? state.tree[selectedNodeId] : undefined;

    const ruleOptions = instanceOfPSCState(state, calculus)
        ? stringArrayToStringMap(ruleSetToStringArray(getNormalRuleSet()))
        : stringArrayToStringMap(ruleSetToStringArray(getFORuleSet()));

    const [selectedRuleId, setSelectedRuleId] = useState<number | undefined>(
        undefined,
    );

    const [showRuleDialog, setShowRuleDialog] = useState(false);

    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);

    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

    const [stats, setStats] = useState<Entry[] | undefined>(undefined);

    const selectRuleCallback = (newRuleId: number) => {
        if (newRuleId === selectedRuleId) {
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
        } else {
            setSelectedRuleId(newRuleId);
            if (
                newRuleId !== undefined &&
                selectedNode !== undefined &&
                selectedNode.children.length === 0
            ) {
                if (newRuleId === 0) {
                    sendMove(
                        server,
                        calculus,
                        state,
                        { type: "Ax", nodeID: selectedNodeId! },
                        onChange,
                        notificationHandler,
                    );
                    setSelectedNodeId(undefined);
                    setSelectedRuleId(undefined);
                    setSelectedListIndex(undefined);
                } else if (
                    newRuleId >= 9 &&
                    newRuleId <= 12 &&
                    selectedListIndex !== undefined
                ) {
                    // Selected Rule is a Quantifier
                    setVarOrigins([nodeName(selectedNode)]);
                    // Open Popup to
                    if (selectedListIndex.charAt(0) === "l") {
                        const formula =
                            selectedNode.leftFormulas[
                                parseStringToListIndex(selectedListIndex)
                            ];
                        if (
                            formula.type === "allquant" ||
                            formula.type === "exquant"
                        ) {
                            setVarsToAssign([formula.varName!]);
                            setShowVarAssignDialog(true);
                        }
                    } else {
                        const formula =
                            selectedNode.rightFormulas[
                                parseStringToListIndex(selectedListIndex)
                            ];
                        if (
                            formula.type === "allquant" ||
                            formula.type === "exquant"
                        ) {
                            setVarsToAssign([formula.varName!]);
                            setShowVarAssignDialog(true);
                        }
                    }
                } else if (selectedListIndex !== undefined) {
                    if (
                        selectedListIndex.charAt(0) === "l" &&
                        getFORuleSet().rules[newRuleId].site === "right"
                    ) {
                        setSelectedRuleId(undefined);
                        notificationHandler.error(
                            "Can't use right hand side rule on the left side!",
                        );
                        return;
                    }
                    if (
                        selectedListIndex.charAt(0) === "r" &&
                        getFORuleSet().rules[newRuleId].site === "left"
                    ) {
                        setSelectedRuleId(undefined);
                        notificationHandler.error(
                            "Can't use left hand side rule on the right side!",
                        );
                        return;
                    }
                    sendMove(
                        server,
                        calculus,
                        state,
                        {
                            type: ruleOptions.get(newRuleId)!,
                            nodeID: selectedNodeId!,
                            listIndex: parseStringToListIndex(
                                selectedListIndex,
                            ),
                        },
                        onChange,
                        notificationHandler,
                    );
                    setSelectedNodeId(undefined);
                    setSelectedRuleId(undefined);
                    setSelectedListIndex(undefined);
                }
            }
        }
    };

    const quantifierCallback = (
        autoAssign: boolean,
        varAssign: VarAssign = {},
    ) => {
        if (selectedRuleId !== undefined && selectedListIndex !== undefined) {
            if (autoAssign) {
                sendMove(
                    server,
                    calculus,
                    state,
                    {
                        type: ruleOptions.get(selectedRuleId)!,
                        nodeID: selectedNodeId!,
                        listIndex: parseStringToListIndex(selectedListIndex),
                    },
                    onChange,
                    notificationHandler,
                );
            } else {
                if (Object.keys(varAssign).length === 0) return;
                sendMove(
                    server,
                    calculus,
                    state,
                    {
                        type: ruleOptions.get(selectedRuleId)!,
                        nodeID: selectedNodeId!,
                        listIndex: parseStringToListIndex(selectedListIndex),
                        varAssign,
                    },
                    onChange,
                    notificationHandler,
                );
            }
        }
        setSelectedNodeId(undefined);
        setSelectedListIndex(undefined);
        setSelectedRuleId(undefined);
        setShowVarAssignDialog(false);
    };

    const selectNodeCallback = (
        newNode: SequentTreeLayoutNode,
        selectValue?: boolean,
    ) => {
        if (selectValue === undefined) {
            if (newNode.id === selectedNodeId) {
                setSelectedNodeId(undefined);
            } else {
                setSelectedNodeId(newNode.id);
                if (
                    selectedRuleId !== undefined &&
                    newNode.children.length === 0 &&
                    selectedListIndex !== undefined
                ) {
                    if (selectedRuleId === 0) {
                        sendMove(
                            server,
                            calculus,
                            state,
                            { type: "Ax", nodeID: newNode.id },
                            onChange,
                            notificationHandler,
                        );
                    } else if (selectedRuleId >= 9 && selectedRuleId <= 12) {
                        // Selected Rule is a Quantifier
                        setVarOrigins([nodeName(newNode)]);
                        // Open Popup to
                        if (selectedListIndex.charAt(0) === "l") {
                            const formula =
                                newNode.leftFormulas[
                                    parseStringToListIndex(selectedListIndex)
                                ];
                            if (
                                formula.type === "allquant" ||
                                formula.type === "exquant"
                            ) {
                                setVarsToAssign([formula.varName!]);
                                setShowVarAssignDialog(true);
                            }
                        } else {
                            const formula =
                                newNode.rightFormulas[
                                    parseStringToListIndex(selectedListIndex)
                                ];
                            if (
                                formula.type === "allquant" ||
                                formula.type === "exquant"
                            ) {
                                setVarsToAssign([formula.varName!]);
                                setShowVarAssignDialog(true);
                            }
                        }
                    } else {
                        sendMove(
                            server,
                            calculus,
                            state,
                            {
                                type: ruleOptions.get(selectedRuleId)!,
                                nodeID: newNode.id,
                                listIndex: parseStringToListIndex(
                                    selectedListIndex,
                                ),
                            },
                            onChange,
                            notificationHandler,
                        );
                    }
                    setSelectedNodeId(undefined);
                    setSelectedRuleId(undefined);
                    setSelectedListIndex(undefined);
                }
            }
        } else if (selectValue === true) {
            setSelectedNodeId(newNode.id);
        } else {
            setSelectedNodeId(undefined);
        }
    };

    const selectFormulaCallback = (newFormula: FormulaTreeLayoutNode) => {
        event?.stopPropagation();
        if (newFormula.id === selectedListIndex) {
            setSelectedListIndex(undefined);
        } else {
            setSelectedListIndex(newFormula.id);
        }
    };

    const disableOptions = (option: number) => {
        if (selectedNodeId === undefined) return false;
        if (state.showOnlyApplicableRules === false) return true;
        const rules = getFORuleSet();
        if (selectedListIndex === undefined || selectedNode === undefined) {
            if (option === 0) {
                return true;
            }
            return false;
        }

        if (rules.rules[option].applicableOn !== undefined) {
            if (selectedListIndex.charAt(0) === "l") {
                if (
                    rules.rules[option].site === "left" ||
                    rules.rules[option].site === "both"
                ) {
                    return (
                        selectedNode.leftFormulas[
                            parseStringToListIndex(selectedListIndex)
                        ].type === rules.rules[option].applicableOn
                    );
                }
                return false;
            }
            if (
                rules.rules[option].site === "right" ||
                rules.rules[option].site === "both"
            ) {
                return (
                    selectedNode.rightFormulas[
                        parseStringToListIndex(selectedListIndex)
                    ].type === rules.rules[option].applicableOn
                );
            }
            return false;
        }
        return true;
    };

    return (
        <Fragment>
            <h2>Sequent Calculus View</h2>

            <div class={style.view}>
                {!smallScreen && (
                    <div>
                        <OptionList
                            options={ruleOptions}
                            selectedOptionIds={
                                selectedRuleId !== undefined
                                    ? [selectedRuleId]
                                    : undefined
                            }
                            selectOptionCallback={(keyValuePair) =>
                                selectRuleCallback(keyValuePair[0])
                            }
                            disableOption={disableOptions}
                        />
                    </div>
                )}

                <SequentTreeView
                    nodes={state.tree}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectedRuleName={selectedRule}
                    selectNodeCallback={selectNodeCallback}
                    selectFormulaCallback={selectFormulaCallback}
                    selectedListIndex={selectedListIndex}
                />
            </div>

            <Dialog
                open={showRuleDialog}
                label="Choose Rule"
                onClose={() => setShowRuleDialog(false)}
            >
                <OptionList
                    options={ruleOptions}
                    selectOptionCallback={(keyValuePair) => {
                        setShowRuleDialog(false);
                        selectRuleCallback(keyValuePair[0]);
                    }}
                    node={
                        selectedNodeId !== undefined
                            ? state.tree[selectedNodeId]
                            : undefined
                    }
                    listIndex={selectedListIndex}
                    disableOption={disableOptions}
                />
            </Dialog>

            <SaveStatsDialog
                open={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                submitCallback={() => setShowSaveDialog(false)}
                stats={stats}
            />

            {instanceOfFOSCState(state, calculus) && (
                <VarAssignDialog
                    open={showVarAssignDialog}
                    onClose={() => setShowVarAssignDialog(false)}
                    varOrigins={varOrigins}
                    vars={Array.from(varsToAssign)}
                    manualVarAssignOnly={true}
                    submitVarAssignCallback={quantifierCallback}
                    secondSubmitEvent={() => {}}
                />
            )}

            <SequentFAB
                calculus={calculus}
                state={state}
                selectedNodeId={selectedNodeId}
                ruleCallback={() => setShowRuleDialog(true)}
                pruneCallback={() =>
                    sendMove(
                        server,
                        calculus,
                        state,
                        { type: "prune", nodeID: selectedNodeId! },
                        onChange,
                        notificationHandler,
                    )
                }
                closeCallback={(statistics: Entry[]) => {
                    setStats(statistics)
                    setShowSaveDialog(true)
                }}
            />
            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default SequentView;
