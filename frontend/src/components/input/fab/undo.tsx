import { h } from "preact";

import {
    Calculus,
    ModalCalculusType,
    TableauxCalculusType,
} from "../../../types/calculus";
import { sendMove } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import UndoIcon from "../../icons/undo";

import FAB from "./index";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculusType | ModalCalculusType;
    /**
     * Callback to reset a specific drag
     */
    resetDragTransform: (id: number) => void;
}

const UndoFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    resetDragTransform,
}) => {
    const {
        [calculus]: state,
        server,
        onChange,
        notificationHandler,
    } = useAppState();

    const moveHistory = state!.moveHistory;

    return (
        <FAB
            icon={<UndoIcon />}
            label="Undo"
            mini={true}
            extended={true}
            showIconAtEnd={true}
            onClick={() => {
                // If the last move added a node, and we undo this, remove the corresponding drag
                if (moveHistory.length > 0) {
                    const move = moveHistory[moveHistory.length - 1];
                    if (
                        move.type &&
                        ["tableaux-expand", "alphaMove", "betaMove"].includes(
                            move.type,
                        )
                    ) {
                        resetDragTransform(state!.tree.length - 1);
                    }
                }
                sendMove(
                    server,
                    calculus,
                    state,
                    {
                        type:
                            calculus === Calculus.modalTableaux
                                ? "undo"
                                : "tableaux-undo",
                    },
                    onChange,
                    notificationHandler,
                );
            }}
        />
    );
};

export default UndoFAB;
