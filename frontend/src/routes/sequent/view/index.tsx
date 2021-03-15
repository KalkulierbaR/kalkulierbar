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
import { Statistics } from "../../../types/app/statistics";
import { SequentCalculusType } from "../../../types/calculus";
import { getFORuleSet, getNormalRuleSet } from "../../../types/calculus/rules";
import {
    FormulaTreeLayoutNode,
    instanceOfFOSCState,
    instanceOfPSCState,
    VarAssign,
} from "../../../types/calculus/sequent";
import { saveStatistics, sendMove } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import { ruleSetToStringArray } from "../../../util/rule";
import { nodeName, parseStringToListIndex } from "../../../util/sequent";

import * as style from "./style.scss";

interface Props {
    /**
     * Which calculus to use
     */
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

    const [stats, setStats] = useState<Statistics | undefined>(undefined);

    /**
     * Sends the Move to the backend
     * @param ruleId the id of the selected rule 
     * @param nodeId the id of the selected node
     * @param listIndex the index of the selected node
     * @returns nothing, just sends a move towards the backend, we use returns as termination methods
     */
    const trySendMove = (
        ruleId: number | undefined,
        nodeId: number | undefined,
        listIndex: string | undefined,
    ) => {
        if (
            ruleId === undefined ||
            nodeId === undefined ||
            listIndex === undefined
        )
            return;

        const node = state.tree[nodeId];

        if (!checkIfRuleIsAppliedOnCorrectSite(listIndex, ruleId)) return;

        if (ruleId === 0) {
            sendMove(
                server,
                calculus,
                state,
                { type: "Ax", nodeID: nodeId },
                onChange,
                notificationHandler,
            );
            resetSelection();
        } else if (ruleId >= 9 && ruleId <= 12 && node !== undefined) {
            // Selected Rule is a Quantifier
            setVarOrigins([nodeName(node)]);
            // Open Popup to
            if (listIndex.charAt(0) === "l") {
                const formula =
                    node.leftFormulas[parseStringToListIndex(listIndex)];
                if (formula.type === "allquant" || formula.type === "exquant") {
                    setVarsToAssign([formula.varName!]);
                    setShowVarAssignDialog(true);
                    return;
                }
            } else {
                const formula =
                    node.rightFormulas[parseStringToListIndex(listIndex)];
                if (formula.type === "allquant" || formula.type === "exquant") {
                    setVarsToAssign([formula.varName!]);
                    setShowVarAssignDialog(true);
                    return;
                }
            }
            notificationHandler.error(
                "Cannot use quantifier rules on a non quantifier formula!",
            );
            resetSelection();
        } else {
            sendMove(
                server,
                calculus,
                state,
                {
                    type: ruleOptions.get(ruleId)!,
                    nodeID: nodeId,
                    listIndex: parseStringToListIndex(listIndex),
                },
                onChange,
                notificationHandler,
            );
            resetSelection();
        }
    };
    /**
     * Checks if the rule gets applied on the correct side
     * @param selected the selected node 
     * @param ruleId the ruleId of the rule the user wants to use 
     * @returns throwns an error if the user wants to use a right side rule on a left side node and the other way around.
     */
    const checkIfRuleIsAppliedOnCorrectSite = (
        selected: string,
        ruleId: number,
    ): boolean => {
        if (
            selected.charAt(0) === "l" &&
            getFORuleSet().rules[ruleId].site === "right"
        ) {
            resetSelection();
            notificationHandler.error(
                "Can't use right hand side rule on the left side!",
            );
            return false;
        }

        if (
            selected.charAt(0) === "r" &&
            getFORuleSet().rules[ruleId].site === "left"
        ) {
            resetSelection();
            notificationHandler.error(
                "Can't use left hand side rule on the right side!",
            );
            return false;
        }

        return true;
    };

    const resetSelection = () => {
        setSelectedRuleId(undefined);
        setSelectedNodeId(undefined);
        setSelectedListIndex(undefined);
    };

    /**
     * Gets called when a rule gets selected (or deselected)
     * @param newRuleId the selected rule
     */
    const selectRuleCallback = (newRuleId: number) => {
        if (newRuleId === selectedRuleId) {
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
        } else {
            setSelectedRuleId(newRuleId);
            trySendMove(newRuleId, selectedNodeId, selectedListIndex);
        }
    };

    /**
     * Sends the backend the choosen quantifier
     * @param autoAssign Wether the backend should auto-assign the quantifier
     * @param varAssign the quantifiers
     * @returns 
     */
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
        resetSelection();
        setShowVarAssignDialog(false);
    };

    /**
     * Gets called when a new formula gets selected (or deselected)
     * @param newFormula selected formula
     * @param nodeId the id of the node
     */
    const selectFormulaCallback = (
        newFormula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => {
        event?.stopPropagation();
        if (newFormula.id === selectedListIndex) {
            resetSelection();
        } else {
            setSelectedListIndex(newFormula.id);
            setSelectedNodeId(nodeId);
            trySendMove(selectedRuleId, nodeId, newFormula.id);
        }
    };
    /**
     * Disables options inside the option list wether it should be or not
     * @param option index of the rule 
     * @returns return true or false depending if some rules should be grayed out
     */
    const disableOptions = (option: number) => {
        if (selectedNodeId === undefined) return true;
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
    /**
     * Saves the closed Proof in the DB
     * @param userName the name the user types in after he succesfully solved a calculus
     */
    const saveStatisticsCallback = (userName: string) => {
        if (userName !== "") {
            saveStatistics(
                server,
                calculus,
                state,
                notificationHandler,
                userName,
            );
            setShowSaveDialog(false);
        }
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
                submitCallback={saveStatisticsCallback}
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
                closeCallback={(statistics: Statistics) => {
                    setStats(statistics);
                    setShowSaveDialog(true);
                }}
            />
            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default SequentView;
