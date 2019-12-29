import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import FAB from "../../fab";
import CloseIcon from "../../icons/close";

import { checkClose } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { nextOpenLeaf } from "../../../helpers/tableaux";
import { TableauxState } from "../../../types/tableaux";
import ClauseList from "../../clause-list";
import AddIcon from "../../icons/add";
import CenterIcon from "../../icons/center";
import CheckCircleIcon from "../../icons/check-circle";
import ExploreIcon from "../../icons/explore";
import MoreIcon from "../../icons/more";
import Dialog from "./dialog";
import * as style from "./style.scss";

interface Props {
    /**
     * The state of tableaux calculus
     */
    state: TableauxState;
    /**
     * The id of the currently selected node.
     * Defaults to `undefined`
     */
    selectedNodeId?: number;
    /**
     * Handler for selecting a clause with id `n`.
     */
    selectedClauseCallback: (n: number) => void;
}

interface MenuProps {
    /**
     * Shows the menu.
     */
    show: boolean;
    /**
     * Handler for changing visibility.
     */
    setShow: (v: boolean) => void;
    /**
     * The state of tableaux calculus
     */
    state: TableauxState;
    /**
     * Handler for selecting a clause with id `n`.
     */
    selectedClauseCallback: (n: number) => void;
}

const MenuNonSelected: preact.FunctionalComponent<MenuProps> = ({
    show,
    setShow,
    state
}) => {
    const { server, onError, onSuccess } = useAppState();

    return (
        <menu
            class={style.menu + (show ? " " + style.show : "")}
            onClick={() => setShow(false)}
        >
            <FAB
                class={style.delay2}
                icon={<ExploreIcon />}
                label="Next Leaf"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() => {
                    const node = nextOpenLeaf(state.nodes);
                    if (node === undefined) {
                        return;
                    }
                    dispatchEvent(
                        new CustomEvent("kbar-go-to-node", {
                            detail: { node }
                        })
                    );
                }}
            />
            <FAB
                class={style.delay1}
                icon={<CenterIcon />}
                label="Center"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() => {
                    dispatchEvent(new CustomEvent("kbar-center-tree"));
                }}
            />
            <FAB
                icon={<CheckCircleIcon />}
                label="Check"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() =>
                    checkClose(
                        server,
                        onError,
                        onSuccess,
                        "prop-tableaux",
                        state
                    )
                }
            />
        </menu>
    );
};

const MenuNodeSelected: preact.FunctionalComponent<MenuProps> = ({
    show,
    setShow,
    state,
    selectedClauseCallback
}) => {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <Fragment>
            <menu
                class={style.menu + (show ? " " + style.show : "")}
                onClick={() => setShow(false)}
            >
                <FAB
                    icon={<AddIcon />}
                    label="Expand"
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() => {
                        setShowDialog(!showDialog);
                    }}
                />
            </menu>
            <Dialog
                open={showDialog}
                label="Choose Clause"
                onClose={() => setShowDialog(false)}
            >
                <ClauseList
                    clauseSet={state.clauseSet}
                    selectedClauseId={undefined}
                    selectClauseCallback={(id: number) => {
                        setShowDialog(false);
                        selectedClauseCallback(id);
                    }}
                />
            </Dialog>
        </Fragment>
    );
};

const TreeControlFAB: preact.FunctionalComponent<Props> = ({
    state,
    selectedNodeId,
    selectedClauseCallback
}) => {
    const [show, setShow] = useState(false);

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    // Choose a menu based upon if a node is selected
    const menu =
        selectedNodeId === undefined ? (
            <MenuNonSelected
                show={show}
                setShow={setShow}
                state={state}
                selectedClauseCallback={selectedClauseCallback}
            />
        ) : (
            <MenuNodeSelected
                show={show}
                setShow={setShow}
                state={state}
                selectedClauseCallback={selectedClauseCallback}
            />
        );

    return (
        <div class={style.control}>
            {menu}
            <FAB icon={icon} label="Open Menu" onClick={() => setShow(!show)} />
        </div>
    );
};

export default TreeControlFAB;
