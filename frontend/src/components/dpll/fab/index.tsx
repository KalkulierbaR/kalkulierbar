import { Fragment, h } from "preact";
import { AppStateActionType, TutorialMode } from "../../../types/app";
import { DPLLNodeType, DPLLState } from "../../../types/dpll";
import { checkClose } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { sendPrune, stateIsClosed } from "../../../util/dpll";
import DownloadFAB from "../../btn/download";
import ControlFAB from "../../control-fab";
import FAB from "../../fab";
import CheckCircleIcon from "../../icons/check-circle";
import CheckCircleFilledIcon from "../../icons/check-circle-filled";
import DeleteIcon from "../../icons/delete";
import SplitIcon from "../../icons/split";
import SwitchIcon from "../../icons/switch";

interface Props {
    /**
     * The current dpll state
     */
    state: DPLLState;
    /**
     * The branch
     */
    branch: number;
    /**
     * Whether to show the tree
     */
    showTree: boolean;
    /**
     * Function to toggle visibility of tree
     */
    toggleShowTree: () => void;
    /**
     * Function to set visibility of model dialog
     */
    setShowModelDialog: (v: boolean) => void;
    /**
     * Function to set visibility of split dialog
     */
    setShowSplitDialog: (v: boolean) => void;
}

const DPLLControlFAB: preact.FunctionalComponent<Props> = ({
    state,
    branch,
    showTree,
    toggleShowTree,
    setShowModelDialog,
    setShowSplitDialog,
}) => {
    const {
        smallScreen,
        server,
        onChange,
        notificationHandler,
        tutorialMode,
        dispatch,
    } = useAppState();

    const couldShowCheckCloseHint = stateIsClosed(state.tree);

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={couldShowCheckCloseHint}
                checkFABPositionFromBottom={3}
            >
                {smallScreen && (
                    <FAB
                        label={showTree ? "Clause View" : "Tree View"}
                        icon={<SwitchIcon />}
                        mini={true}
                        extended={true}
                        onClick={toggleShowTree}
                    />
                )}
                {state.tree[branch].type === DPLLNodeType.MODEL && (
                    <FAB
                        icon={<CheckCircleFilledIcon />}
                        label="Model Check"
                        mini={true}
                        extended={true}
                        showIconAtEnd={true}
                        onClick={() => setShowModelDialog(true)}
                    />
                )}
                <DownloadFAB state={state} name="dpll" />
                <FAB
                    icon={<CheckCircleIcon />}
                    label="Check"
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() => {
                        if (tutorialMode & TutorialMode.HighlightCheck) {
                            dispatch({
                                type: AppStateActionType.SET_TUTORIAL_MODE,
                                value:
                                    tutorialMode ^ TutorialMode.HighlightCheck,
                            });
                        }
                        checkClose(server, notificationHandler, "dpll", state);
                    }}
                />
                <FAB
                    label="Prune"
                    icon={<DeleteIcon />}
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() =>
                        sendPrune(
                            server,
                            state,
                            branch,
                            onChange,
                            notificationHandler,
                        )
                    }
                />
                <FAB
                    label="Split"
                    icon={<SplitIcon />}
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() => setShowSplitDialog(true)}
                />
            </ControlFAB>
        </Fragment>
    );
};

export default DPLLControlFAB;
