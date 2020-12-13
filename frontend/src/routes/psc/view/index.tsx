import { Fragment, h } from "preact";
import { PropCalculusType } from "../../../types/calculus";
import { useCallback, useEffect, useState } from "preact/hooks";
import OptionList from "../../../components/input/option-list";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";

import * as style from "./style.scss";
import { route } from "preact-router";

import {  } from "../../../types/calculus"


interface Props {
    calculus: PropCalculusType;
}

const PSCView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
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

    const [dragTransforms, setDragTransforms] = useState<
            Record<number, DragTransform>
        >({});

    const onDrag = useCallback(updateDragTransform(setDragTransforms), [
         setDragTransforms,
    ]);

    const resetDragTransform = useCallback(
         (id: number) => onDrag(id, { x: 0, y: 0 }),
         [onDrag],
    );
    const resetDragTransforms = useCallback(() => setDragTransforms({}), [
        setDragTransforms,
    ]);
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
         undefined,
    );

    const selectedNode =
         selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;

    const ruleOptions = stringArrayToStringMap(state.ruleSet);

    const [selectedRuleId, setSelectedRuleId] = useState<
        number | undefined
    >(undefined);

    const selectRuleCallback = (newRuleId: number) => {
        if(newRuleId === selectedRuleId){
            // The same Rule was selected again => deselect it
            setSelectedRuleId(undefined);
            setSelectedNodeId(undefined);
        }else if(selectedNodeId !== undefined){
        //care about if one node is selected
        }else{
            setSelectedRuleId(newRuleId);
        }
    };
    
    return (
        <Fragment>
            <h2>PSC View</h2>

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
            </div>
        </Fragment>

    );
    
};

export default PSCView;