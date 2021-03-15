import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useState } from "preact/hooks";

import SequentFAB from "../../../components/calculus/sequent/fab";
import SequentTreeView from "../../../components/calculus/sequent/tree";
import Dialog from "../../../components/dialog";
import VarAssignDialog from "../../../components/dialog/var-assign";
import OptionList from "../../../components/input/option-list";
import TutorialDialog from "../../../components/tutorial/dialog";
import { SequentCalculusType } from "../../../types/calculus";
import { getFORuleSet, getNormalRuleSet } from "../../../types/calculus/rules";
import {
    FormulaTreeLayoutNode,
    instanceOfFOSCState,
    instanceOfPSCState,
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

    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

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

        if (ruleId === 0) {
            sendMove(
                server,
                calculus,
                state,
                { type: "Ax", nodeID: nodeId },
                onChange,
                notificationHandler,
            );
            setSelectedNodeId(undefined);
            setSelectedRuleId(undefined);
            setSelectedListIndex(undefined);
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
            setSelectedNodeId(undefined);
            setSelectedRuleId(undefined);
            setSelectedListIndex(undefined);
        } else {
            if (
                listIndex.charAt(0) === "l" &&
                getFORuleSet().rules[ruleId].site === "right"
            ) {
                setSelectedRuleId(undefined);
                notificationHandler.error(
                    "Can't use right hand side rule on the left side!",
                );
                return;
            }
            if (
                listIndex.charAt(0) === "r" &&
                getFORuleSet().rules[ruleId].site === "left"
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
                    type: ruleOptions.get(ruleId)!,
                    nodeID: nodeId,
                    listIndex: parseStringToListIndex(listIndex),
                },
                onChange,
                notificationHandler,
            );
            setSelectedNodeId(undefined);
            setSelectedRuleId(undefined);
            setSelectedListIndex(undefined);
        }
    };

    const selectRuleCallback = (newRuleId: number) => {
        if (newRuleId === selectedRuleId) {
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
        } else {
            setSelectedRuleId(newRuleId);
            trySendMove(newRuleId, selectedNodeId, selectedListIndex);
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

    const selectFormulaCallback = (
        newFormula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => {
        event?.stopPropagation();
        if (newFormula.id === selectedListIndex) {
            setSelectedListIndex(undefined);
            setSelectedNodeId(undefined);
            setSelectedRuleId(undefined);
        } else {
            setSelectedListIndex(newFormula.id);
            setSelectedNodeId(nodeId);
            trySendMove(selectedRuleId, nodeId, newFormula.id);
        }
    };

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
            />
            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default SequentView;
