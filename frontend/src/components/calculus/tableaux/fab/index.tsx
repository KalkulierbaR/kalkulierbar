import { Fragment, h } from "preact";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import AddIcon from "../../../icons/add";
import {
    FOTableauxState,
    PropTableauxState,
} from "../../../../types/calculus/tableaux";
import { useAppState } from "../../../../util/app-state";
import { nextOpenLeaf, sendBacktrack } from "../../../../util/tableaux";
import DownloadFAB from "../../../input/fab/download";
import ExploreIcon from "../../../icons/explore";
import LemmaIcon from "../../../icons/lemma";
import UndoIcon from "../../../icons/undo";
import { TableauxCalculusType } from "../../../../types/calculus";
import CheckCloseFAB from "../../../input/fab/check-close";
import CenterFAB from "../../../input/fab/center";

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
        notificationHandler,
    } = useAppState();

    const showUndoFAB = state.backtracking && state.moveHistory.length > 0;

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={state.nodes[0].isClosed}
                checkFABPositionFromBottom={showUndoFAB ? 2 : 1}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
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
                        <CenterFAB resetDragTransforms={resetDragTransforms} />
                        <CheckCloseFAB calculus={calculus} />
                        {showUndoFAB && (
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
                                        state,
                                        onChange,
                                        notificationHandler,
                                    );
                                }}
                            />
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        <CenterFAB resetDragTransforms={resetDragTransforms} />
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
