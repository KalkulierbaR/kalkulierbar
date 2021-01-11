import { Fragment, h } from "preact";
import { Calculus, PropCalculusType } from "../../../types/calculus";
import { useCallback, useEffect, useState } from "preact/hooks";
import OptionList from "../../../components/input/option-list";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import { ruleSetToStringArray } from "../../../util/rule";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import { getRuleSet } from "../../../types/calculus/rules";
import PSCTreeView from "../../../components/calculus/psc/tree"
import { PSCNode, PSCTreeLayoutNode } from "../../../types/calculus/psc";

import * as style from "./style.scss";
import { route } from "preact-router";
import { selected } from "../../../components/svg/rectangle/style.scss";
import PSCFAB from "../../../components/calculus/psc/fab";
import { NotificationType } from "../../../types/app/notification";
import TutorialDialog from "../../../components/tutorial/dialog";
import { sendMove } from "../../../util/api";


interface Props {}

const PSCView: preact.FunctionalComponent<Props> = () => {
    
    const {
        server,
        psc: cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    let selectedRule: string = "";

    const state = cState;
    if (!state) {
        route(`/psc`);
        return null;
    }
    
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
         undefined
    );

    const selectedNode =
         selectedNodeId !== undefined ? state.tree[selectedNodeId] : undefined;

    const ruleOptions = stringArrayToStringMap(ruleSetToStringArray(getRuleSet()));

    const [selectedRuleId, setSelectedRuleId] = useState<
        number | undefined
    >(undefined);

    const selectRuleCallback = (newRuleId: number) => {
        if(newRuleId === selectedRuleId){
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
        }else{
            setSelectedRuleId(newRuleId);
            if(newRuleId !== undefined && selectedNode !== undefined && selectedNode.type === "leaf"){
                if(newRuleId === 0){
                    sendMove(
                        server, Calculus.psc, state, {type: "Ax", nodeID: selectedNodeId!}, onChange,notificationHandler,
                    )
                } else {
                    sendMove(
                        server, Calculus.psc, state, {type: ruleOptions.get(newRuleId)!, nodeID: selectedNodeId!, listIndex: 0}, onChange,notificationHandler,
                    )
                }
                setSelectedNodeId(undefined);
                setSelectedRuleId(undefined);
                
            }
        }
    };

    const selectNodeCallback = (
        newNode: PSCTreeLayoutNode,
    ) => {
        const newNodeIsLeaf = newNode.type === "leaf";

        if(newNode.id === selectedNodeId){
            setSelectedNodeId(undefined);
        }else if(selectedNodeId === undefined) {
            setSelectedNodeId(newNode.id);
            if(selectedRuleId !== undefined && newNodeIsLeaf){
                if(selectedRuleId === 0){
                    sendMove(
                        server, Calculus.psc, state, {type: "Ax", nodeID: newNode.id}, onChange,notificationHandler,
                    )
                } else {
                    sendMove(
                        server, Calculus.psc, state, {type: ruleOptions.get(selectedRuleId)!, nodeID: newNode.id, listIndex: 0}, onChange,notificationHandler,
                    )
                }
                setSelectedNodeId(undefined);
                setSelectedRuleId(undefined);
                
            }
        }
    };
    
    
    return (
        <Fragment>
            <h2>Propositional Sequent Calculus</h2>

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
                        />
                    </div>
                )}

                <PSCTreeView
                    nodes={state.tree}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectedRuleName={selectedRule}
                    selectNodeCallback={selectNodeCallback}
                />
            </div>

            <PSCFAB 
                calculus={Calculus.psc}
                state={state}
                selectedNodeId={selectedNodeId}
                expandCallback={() => {notificationHandler.error("This is not implemented yet")}}
            />
            <TutorialDialog calculus={Calculus.psc} />

        </Fragment>

    );
    

};

export default PSCView;