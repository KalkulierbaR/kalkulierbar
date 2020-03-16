import { Fragment, h } from "preact";
import ControlFAB from "../../../components/control-fab";
import FAB from "../../../components/fab";
import AddIcon from "../../../components/icons/add";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import {
    AppStateActionType,
    TableauxCalculusType,
    TutorialMode,
} from "../../../types/app";
import { FOTableauxState, PropTableauxState } from "../../../types/tableaux";
import {checkClose} from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { nextOpenLeaf, sendBacktrack } from "../../../util/tableaux";
import ExploreIcon from "../../icons/explore";
import LemmaIcon from "../../icons/lemma";
import UndoIcon from "../../icons/undo";
import Tutorial from "../../tutorial";

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
        onError,
        onChange,
        onSuccess,
        tutorialMode,
        dispatch,
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
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        {resetView}
                        {state!.nodes.filter((node) => !node.isClosed).length >
                        0 ? (
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
                        ) : undefined}
                        <FAB
                            icon={<CheckCircleIcon />}
                            label="Check"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                if (
                                    tutorialMode & TutorialMode.HighlightCheck
                                ) {
                                    dispatch({
                                        type:
                                            AppStateActionType.SET_TUTORIAL_MODE,
                                        value:
                                            tutorialMode ^
                                            TutorialMode.HighlightCheck,
                                    });
                                }
                                checkClose(
                                    server,
                                    onError,
                                    onSuccess,
                                    calculus,
                                    state,
                                );
                            }}
                        />
                        {state!.backtracking ? (
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
                                        if (move.type === "EXPAND") {
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
                                        onError,
                                    );
                                }}
                            />
                        ) : undefined}
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
                        ) : state!.nodes[selectedNodeId].children.length ===
                              0 &&
                          state!.nodes.filter((node) => node.isClosed).length >
                              0 ? (
                            <FAB
                                icon={<LemmaIcon />}
                                label="Lemma"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={lemmaCallback}
                            />
                        ) : undefined}
                    </Fragment>
                )}
            </ControlFAB>

            {!smallScreen &&
                couldShowCheckCloseHint &&
                (tutorialMode & TutorialMode.HighlightCheck) !== 0 && (
                    <Tutorial
                        text="Check if the proof is complete"
                        right="205px"
                        bottom="115px"
                    />
                )}
        </Fragment>
    );
};

export default TableauxFAB;
