import { Fragment, h } from "preact";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import AddIcon from "../../../icons/add";
import CenterIcon from "../../../icons/center";
import CheckCircleIcon from "../../../icons/check-circle";
import {
    FOTableauxState,
    PropTableauxState,
} from "../../../../types/calculus/tableaux";
import { checkClose } from "../../../../util/api";
import { useAppState } from "../../../../util/app-state";
import { nextOpenLeaf, sendBacktrack } from "../../../../util/tableaux";
import {
    disableTutorial,
    getHighlightCheck,
} from "../../../../util/tutorial-mode";
import DownloadFAB from "../../../input/btn/download";
import ExploreIcon from "../../../icons/explore";
import LemmaIcon from "../../../icons/lemma";
import UndoIcon from "../../../icons/undo";
import { TableauxCalculusType } from "../../../../types/calculus";
import { TutorialMode } from "../../../../types/app/tutorial";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculusType;
    /**
     * The current calculus state
     */
    state: PropTableauxState | FOTableauxState;
    /**
     * Which node is currently selected
     */
    selectedNodeId?: number;
    /**
     * Callback if expand FAB is clicked
     */
    expandCallback: () => void;
    /**
     * Whether lemma mode is enabled
     */
    lemmaMode: boolean;
    /**
     * Callback if lemma FAB is clicked
     */
    lemmaCallback: () => void;
    /**
     * Callback to reset a specific drag
     */
    resetDragTransform: (id: number) => void;
    /**
     * Callback to reset all drags
     */
    resetDragTransforms: () => void;
}

const TableauxFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedNodeId,
    expandCallback,
    lemmaMode,
    lemmaCallback,
    resetDragTransform,
    resetDragTransforms,
}) => {
    const {
        server,
        smallScreen,
        onChange,
        tutorialMode,
        dispatch,
        notificationHandler,
    } = useAppState();

    const resetView = (
        <FAB
            icon={<CenterIcon />}
            label="Reset View"
            mini={true}
            extended={true}
            showIconAtEnd={true}
            onClick={() => {
                dispatchEvent(new CustomEvent("center"));
                resetDragTransforms();
            }}
        />
    );

    const couldShowCheckCloseHint = state.nodes[0].isClosed;

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={couldShowCheckCloseHint}
                checkFABPositionFromBottom={2}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        {resetView}
                        <DownloadFAB state={state} name={calculus} />
                        {state.nodes.filter((node) => !node.isClosed).length >
                            0 && (
                            <FAB
                                icon={<ExploreIcon />}
                                label="Next Leaf"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    const node = nextOpenLeaf(state!.nodes);
                                    if (node === undefined) {
                                        return;
                                    }
                                    dispatchEvent(
                                        new CustomEvent("go-to", {
                                            detail: { node },
                                        }),
                                    );
                                }}
                            />
                        )}
                        <FAB
                            icon={<CheckCircleIcon />}
                            label="Check"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                if (getHighlightCheck(tutorialMode)) {
                                    disableTutorial(
                                        dispatch,
                                        tutorialMode,
                                        TutorialMode.HighlightCheck,
                                    );
                                }
                                checkClose(
                                    server,
                                    notificationHandler,
                                    calculus,
                                    state,
                                );
                            }}
                        />
                        {state.backtracking && state.moveHistory.length > 0 && (
                            <FAB
                                icon={<UndoIcon />}
                                label="Undo"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    // If the last move added a node, and we undo this, remove the corresponding drag
                                    if (state.moveHistory.length > 0) {
                                        const move =
                                            state.moveHistory[
                                                state.moveHistory.length - 1
                                            ];
                                        if (move.type === "tableaux-expand") {
                                            resetDragTransform(
                                                state.nodes.length - 1,
                                            );
                                        }
                                    }
                                    sendBacktrack(
                                        calculus,
                                        server,
                                        state!,
                                        onChange,
                                        notificationHandler,
                                    );
                                }}
                            />
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        {resetView}
                        <FAB
                            icon={<AddIcon />}
                            label="Expand"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={expandCallback}
                        />
                        {lemmaMode ? (
                            <FAB
                                icon={<LemmaIcon fill="#000" />}
                                label="Lemma"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={lemmaCallback}
                                active={true}
                            />
                        ) : (
                            state!.nodes[selectedNodeId].children.length ===
                                0 &&
                            state!.nodes.filter((node) => node.isClosed)
                                .length > 0 && (
                                <FAB
                                    icon={<LemmaIcon />}
                                    label="Lemma"
                                    mini={true}
                                    extended={true}
                                    showIconAtEnd={true}
                                    onClick={lemmaCallback}
                                />
                            )
                        )}
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default TableauxFAB;
