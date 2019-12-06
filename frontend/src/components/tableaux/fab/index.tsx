import { h } from "preact";
import { useContext, useState } from "preact/hooks";
import FAB from "../../fab";
import CloseIcon from "../../icons/close";

import { TableauxState } from "../../../types/tableaux";
import { CheckClose } from "../../app";
import CenterIcon from "../../icons/center";
import CheckCircleIcon from "../../icons/check-circle";
import MoreIcon from "../../icons/more";
import * as style from "./style.css";

interface Props {
    state: TableauxState;
}

const TreeControlFAB: preact.FunctionalComponent<Props> = ({ state }) => {
    const [show, setShow] = useState(false);
    const checkClose = useContext(CheckClose)!;

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    const menu = (
        <menu class={style.menu + (show ? " " + style.show : "")}>
            <FAB
                class={style.delay1}
                icon={<CheckCircleIcon />}
                label="Check"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() => checkClose("prop-tableaux", state)}
            />
            <FAB
                icon={<CenterIcon />}
                label="Center"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() => {
                    dispatchEvent(new CustomEvent("kbar-center-tree"));
                }}
            />
        </menu>
    );

    return (
        <div class={style.control}>
            {menu}
            <FAB icon={icon} label="Open Menu" onClick={() => setShow(!show)} />
        </div>
    );
};

export default TreeControlFAB;
