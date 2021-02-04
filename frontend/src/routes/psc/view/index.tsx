import { Fragment, h } from "preact";
import { Calculus, PropCalculusType, PSCCalculusType } from "../../../types/calculus";
import { useCallback, useEffect, useState } from "preact/hooks";
import OptionList from "../../../components/input/option-list";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import { ruleSetToStringArray } from "../../../util/rule";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import { getNormalRuleSet, getFORuleSet } from "../../../types/calculus/rules";
import PSCTreeView from "../../../components/calculus/psc/tree"
import { FormulaTreeLayoutNode, instanceOfFOSCState, instanceOfPSCState, PSCNode, PSCTreeLayoutNode, VarAssign } from "../../../types/calculus/psc";

import * as style from "./style.scss";
import { route } from "preact-router";
import { selected } from "../../../components/svg/rectangle/style.scss";
import PSCFAB from "../../../components/calculus/psc/fab";
import { NotificationType } from "../../../types/app/notification";
import TutorialDialog from "../../../components/tutorial/dialog";
import { sendMove } from "../../../util/api";
import Dialog from "../../../components/dialog";
import VarAssignDialog from "../../../components/dialog/var-assign";
import { nodeName } from "../../../util/psc";


interface Props {
    calculus: PSCCalculusType;
}

const PSCView: preact.FunctionalComponent<Props> = ({calculus}) => {
    
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
         undefined
    );

    const [selectedListIndex, setSelectedListIndex] = useState<string | undefined>(
        undefined
    );

    const selectedNode =
         selectedNodeId !== undefined ? state.tree[selectedNodeId] : undefined;

    const ruleOptions = instanceOfPSCState(state, calculus) ? stringArrayToStringMap(ruleSetToStringArray(getNormalRuleSet())) : stringArrayToStringMap(ruleSetToStringArray(getFORuleSet()));

    const [selectedRuleId, setSelectedRuleId] = useState<
        number | undefined
    >(undefined);

    const [showRuleDialog, setShowRuleDialog] = useState(false);

    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);

    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

    const selectRuleCallback = (newRuleId: number) => {
        if(newRuleId === selectedRuleId){
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
        }else{
            setSelectedRuleId(newRuleId);
            if(newRuleId !== undefined && selectedNode !== undefined && selectedNode.children.length === 0 && selectedListIndex !== undefined){
                if(newRuleId === 0){
                    sendMove(
                        server, calculus, state, {type: "Ax", nodeID: selectedNodeId!}, onChange,notificationHandler,
                    )
                    setSelectedNodeId(undefined);
                    setSelectedRuleId(undefined);
                } else if (newRuleId >= 9 && newRuleId <= 12) {
                    // Selected Rule is a Quantifier
                    setVarOrigins([nodeName(selectedNode)]);
                    // Open Popup to
                    if (selectedListIndex.charAt(0) === "l") {
                        const formula = selectedNode.leftFormulas[parseStringToListIndex(selectedListIndex)]
                        if (formula.type === "allquant" || formula.type === "exquant") {
                            setVarsToAssign([formula.varName!]);
                            setShowVarAssignDialog(true);
                        }
                        
                    } else {
                        const formula = selectedNode.rightFormulas[parseStringToListIndex(selectedListIndex)]
                        if (formula.type === "allquant" || formula.type === "exquant") {
                            setVarsToAssign([formula.varName!]);
                            setShowVarAssignDialog(true);
                        }
                    }
                } else {
                    sendMove(
                        server, calculus, state, {type: ruleOptions.get(newRuleId)!, nodeID: selectedNodeId!, listIndex: parseStringToListIndex(selectedListIndex)}, onChange,notificationHandler,
                    )
                    setSelectedNodeId(undefined);
                    setSelectedRuleId(undefined);
                }
                
                
            }
        }
    };

    const quantifierCallback = ( autoAssign: boolean, varAssign: VarAssign= {}) => {
        if (selectedRuleId !== undefined && selectedListIndex !== undefined) {
            if (autoAssign) {
                sendMove(
                    server, 
                    calculus, 
                    state, 
                    {type: ruleOptions.get(selectedRuleId)!, nodeID: selectedNodeId!, listIndex: parseStringToListIndex(selectedListIndex)}, 
                    onChange,
                    notificationHandler,
                )
            } else {
                sendMove(
                    server, 
                    calculus, 
                    state, 
                    {type: ruleOptions.get(selectedRuleId)!, nodeID: selectedNodeId!, listIndex: parseStringToListIndex(selectedListIndex), varAssign}, 
                    onChange,
                    notificationHandler,
                )
            }
        }
        setSelectedNodeId(undefined);
        setSelectedListIndex(undefined);
        setSelectedRuleId(undefined);
        setShowVarAssignDialog(false);
    }

    const parseStringToListIndex = (str: string) => {
        return parseInt(str.substring(1));
    }

    const selectNodeCallback = (
        newNode: PSCTreeLayoutNode,
        selectValue?: boolean,
    ) => {
        if (selectValue === undefined) {
            if(newNode.id === selectedNodeId){
                setSelectedNodeId(undefined);
            }else {
                setSelectedNodeId(newNode.id);
                if(selectedRuleId !== undefined && newNode.children.length === 0 && selectedListIndex !== undefined){
                        if(selectedRuleId === 0){
                            sendMove(
                                server, calculus, state, {type: "Ax", nodeID: newNode.id}, onChange,notificationHandler,
                            )
                        } else if (selectedRuleId >= 9 && selectedRuleId <= 12) {
                            // Selected Rule is a Quantifier
                            setVarOrigins([nodeName(newNode)]);
                            // Open Popup to
                            if (selectedListIndex.charAt(0) === "l") {
                                const formula = newNode.leftFormulas[parseStringToListIndex(selectedListIndex)]
                                if (formula.type === "allquant" || formula.type === "exquant") {
                                    setVarsToAssign([formula.varName!]);
                                    setShowVarAssignDialog(true);
                                }
                                
                            } else {
                                const formula = newNode.rightFormulas[parseStringToListIndex(selectedListIndex)]
                                if (formula.type === "allquant" || formula.type === "exquant") {
                                    setVarsToAssign([formula.varName!]);
                                    setShowVarAssignDialog(true);
                                }
                            }
                        } else {
                            sendMove(
                                server, calculus, state, {type: ruleOptions.get(selectedRuleId)!, nodeID: newNode.id, listIndex: parseStringToListIndex(selectedListIndex)}, onChange,notificationHandler,
                            )
                        }
                        setSelectedNodeId(undefined);
                        setSelectedRuleId(undefined);

                }
            }
        }else{
            if (selectValue === true) {
                setSelectedNodeId(newNode.id);
            } else {
                setSelectedNodeId(undefined);
            }
        }
        
    };

    const selectFormulaCallback = (
        newFormula: FormulaTreeLayoutNode,
    ) => {
        event?.stopPropagation();
        if(newFormula.id === selectedListIndex){
            setSelectedListIndex(undefined);
            setSelectedNodeId(undefined);
        } else {
            setSelectedListIndex(newFormula.id);
        }
        
    }

    const disableOptions = (
        option: number 
    ) => {
        if (state.showOnlyApplicableRules === false)
            return true;
        const rules = getFORuleSet();
        if (selectedListIndex === undefined || selectedNodeId === undefined || selectedNode === undefined)
            return true;
        if (rules.rules[option].applicableOn !== undefined) {
            if (selectedListIndex.charAt(0) === 'l') {
                if (rules.rules[option].site === 'left' || rules.rules[option].site === 'both') {
                    return selectedNode.leftFormulas[parseStringToListIndex(selectedListIndex)].type === rules.rules[option].applicableOn;
                }
                return false;
            } 
                if (rules.rules[option].site === 'right' || rules.rules[option].site === 'both') {
                    return selectedNode.rightFormulas[parseStringToListIndex(selectedListIndex)].type === rules.rules[option].applicableOn;
                }
                return false;
            
        } 
        return true;
    }
    
    
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

                <PSCTreeView
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
                    disableOption={disableOptions}
                />
            </Dialog>

            {instanceOfFOSCState(state, calculus) && (
                <VarAssignDialog
                    open={showVarAssignDialog}
                    onClose={() => setShowVarAssignDialog(false)}
                    varOrigins={varOrigins}
                    vars={Array.from(varsToAssign)}
                    manualVarAssignOnly={false}
                    submitVarAssignCallback={quantifierCallback}
                    secondSubmitEvent={() => {}}
                />
            )}

                
            <PSCFAB 
                calculus={calculus}
                state={state}
                selectedNodeId={selectedNodeId}
                ruleCallback={ () => setShowRuleDialog(true)}
                pruneCallback={ () => sendMove(server,calculus,state,{type: "prune", nodeID: selectedNodeId!},onChange,notificationHandler)}
            />
            <TutorialDialog calculus={Calculus.psc} />

        </Fragment>

    );
    

};

export default PSCView;