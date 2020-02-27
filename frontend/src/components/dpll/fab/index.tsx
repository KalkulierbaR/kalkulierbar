import { h } from "preact";
import { checkClose } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { sendPrune } from "../../../helpers/dpll";
import { showTree } from "../../../routes/dpll/view/style.scss";
import { DPLLNodeType, DPLLState } from "../../../types/dpll";
import ControlFAB from "../../control-fab";
import FAB from "../../fab";
import CheckCircleIcon from "../../icons/check-circle";
import DeleteIcon from "../../icons/delete";
import SplitIcon from "../../icons/split";
import SwitchIcon from "../../icons/switch";

interface Props {
    state: DPLLState;
    branch: number;
    toggleShowTree: () => void;
    setShowModelDialog: (v: boolean) => void;
    setShowSplitDialog: (v: boolean) => void;
}

const DPLLControlFAB: preact.FunctionalComponent<Props> = ({
    state,
    branch,
    toggleShowTree,
    setShowModelDialog,
    setShowSplitDialog,
}) => {
    const { smallScreen, server, onChange, onError, onSuccess } = useAppState();

    return (
        <ControlFAB alwaysOpen={!smallScreen}>
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
                    icon={null}
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
                onClick={() =>
                    checkClose(server, onError, onSuccess, "dpll", state)
                }
            />
            <FAB
                label="Prune"
                icon={<DeleteIcon />}
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() =>
                    sendPrune(server, state, branch, onChange, onError)
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
    );
};

export default DPLLControlFAB;
