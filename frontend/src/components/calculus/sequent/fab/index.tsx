import { Fragment, h } from "preact";
import { Statistics } from "../../../../types/app/statistics";

import { SequentCalculusType } from "../../../../types/calculus";
import { FOSCState, PSCState } from "../../../../types/calculus/sequent";
import { sendMove } from "../../../../util/api";
import { useAppState } from "../../../../util/app-state";
import DeleteIcon from "../../../icons/delete";
import RuleIcon from "../../../icons/rule";
import UndoIcon from "../../../icons/undo";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import CheckCloseFAB from "../../../input/fab/check-close";
import DownloadFAB from "../../../input/fab/download";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: SequentCalculusType;
    /**
     * The current calculus state
     */
    state: PSCState | FOSCState;
    /**
     * Which node is currently selected
     */
    selectedNodeId?: number;
    /**
     * Opens Rule Dialog
     */
    ruleCallback: () => void;
    /**
     * Deletes selected Branch
     */
    pruneCallback: () => void;
    /**
     * Opens Save Dialog
     */
    closeCallback: (stats: Statistics) => void;
}

const SequentFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedNodeId,
    ruleCallback,
    pruneCallback,
    closeCallback,
}) => {
    const {
        server,
        smallScreen,
        onChange,
        notificationHandler,
    } = useAppState();

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={false}
                checkFABPositionFromBottom={1}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
                        <CheckCloseFAB
                            calculus={calculus}
                            onProofen={closeCallback}
                        />
                        <FAB
                            icon={<UndoIcon />}
                            label="Undo"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                // If the last move added a node, and we undo this, remove the corresponding drag
                                if (state.tree.length > 0) {
                                    sendMove(
                                        server,
                                        calculus,
                                        state,
                                        { type: "undo" },
                                        onChange,
                                        notificationHandler,
                                    );
                                } else {
                                    return;
                                }
                            }}
                        />
                    </Fragment>
                ) : (
                    <Fragment>
                        <FAB
                            icon={<RuleIcon />}
                            label="Rules"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                ruleCallback();
                            }}
                        />
                        <FAB
                            icon={<DeleteIcon />}
                            label="Prune"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                pruneCallback();
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default SequentFAB;
