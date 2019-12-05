import { h } from "preact";
import { useState } from "preact/hooks";
import FAB from "../../fab";
import CloseIcon from "../../icons/close";

import CenterIcon from "../../icons/center";
import MoreIcon from "../../icons/more";
import * as style from "./style.css";

interface Props {}

const TreeControlFAB: preact.FunctionalComponent<Props> = () => {
    const [show, setShow] = useState(false);

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    const menu = show && (
        <menu class={style.menu}>
            <FAB
                icon={<CenterIcon fill="#fff" />}
                label="Center"
                mini={true}
                extended={true}
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
