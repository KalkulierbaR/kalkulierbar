import { Fragment, h } from "preact";

import { TableauxCalculusType } from "../../../../types/calculus";
import {
    FOTableauxState,
    PropTableauxState,
} from "../../../../types/calculus/tableaux";
import { useAppState } from "../../../../util/app-state";
import AddIcon from "../../../icons/add";
import LemmaIcon from "../../../icons/lemma";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import CenterFAB from "../../../input/fab/center";
import CheckCloseFAB from "../../../input/fab/check-close";
import DownloadFAB from "../../../input/fab/download";
import NextLeafFAB from "../../../input/fab/next-leaf";
import UndoFAB from "../../../input/fab/undo";

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
    const { smallScreen } = useAppState();

    const showUndoFAB = state.backtracking && state.moveHistory.length > 0;

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={state.tree[0].isClosed}
                checkFABPositionFromBottom={showUndoFAB ? 2 : 1}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
                        {state.tree.filter((node) => !node.isClosed).length >
                            0 && <NextLeafFAB calculus={calculus} />}
                        <CenterFAB resetDragTransforms={resetDragTransforms} />
                        <CheckCloseFAB calculus={calculus} />
                        {showUndoFAB && (
                            <UndoFAB
                                calculus={calculus}
                                resetDragTransform={resetDragTransform}
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
                            state!.tree[selectedNodeId].children.length === 0 &&
                            state!.tree.filter((node) => node.isClosed).length >
                                0 && (
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
