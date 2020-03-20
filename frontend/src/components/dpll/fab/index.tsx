import { Fragment, h } from "preact";
import { AppStateActionType, TutorialMode } from "../../../types/app";
import { DPLLNodeType, DPLLState } from "../../../types/dpll";
import { checkClose } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { sendPrune, stateIsClosed } from "../../../util/dpll";
import ControlFAB from "../../control-fab";
import FAB from "../../fab";
import CheckCircleIcon from "../../icons/check-circle";
import CheckCircleFilledIcon from "../../icons/check-circle-filled";
import DeleteIcon from "../../icons/delete";
import SplitIcon from "../../icons/split";
import SwitchIcon from "../../icons/switch";
import Tutorial from "../../tutorial";

interface Props {
    state: DPLLState;
    branch: number;
    showTree: boolean;
    toggleShowTree: () => void;
    setShowModelDialog: (v: boolean) => void;
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
        onError,
        onSuccess,
        tutorialMode,
        dispatch,
        onWarning,
    } = useAppState();

    const couldShowCheckCloseHint = stateIsClosed(state.tree);

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={couldShowCheckCloseHint}
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
                        checkClose(server, onError, onSuccess, "dpll", state);
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
                            onError,
                            onWarning,
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
            {!smallScreen &&
                couldShowCheckCloseHint &&
                (tutorialMode & TutorialMode.HighlightCheck) !== 0 && (
                    <Tutorial
                        text="Check if the proof is complete"
                        right="205px"
                        bottom="165px"
                    />
                )}
        </Fragment>
    );
};

export default DPLLControlFAB;
