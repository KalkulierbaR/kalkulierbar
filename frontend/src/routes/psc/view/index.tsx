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
import { PSCNode } from "../../../types/calculus/psc";

import * as style from "./style.scss";
import { route } from "preact-router";
import { selected } from "../../../components/svg/rectangle/style.scss";
import PSCFAB from "../../../components/calculus/psc/fab";
import { NotificationType } from "../../../types/app/notification";
import TutorialDialog from "../../../components/tutorial/dialog";


interface Props {}

const PSCView: preact.FunctionalComponent<Props> = () => {
    
    const {
        server,
        psc: cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    const state = cState;
    /*
     * sends you back if sequence is null
    if (!state) {
        route(`/${calculus}`);
        return null;
    }
    */
    


    

    

    
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
         undefined,
    );

    const selectedNode =
         selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;

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
        }
    };

    const selectedNodeCallback = (

    ) => {

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
                    nodes={[] as PSCNode[]}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectedNodeCallback={selectedNodeCallback}
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