import { h } from "preact";
import { useState } from "preact/hooks";
import FAB from "../fab";
import CloseIcon from "../icons/close";

import MoreIcon from "../icons/more";
import * as style from "./style.scss";

interface Props {
    /**
     * The components DOM children
     */
    children: any
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
}

const Menu: preact.FunctionalComponent<MenuProps> = ({
    show,
    setShow,
    children
}) => {
    return (
        <menu
            class={style.menu + (show ? " " + style.show : "")}
            onClick={() => setShow(false)}
        >
            {children}
        </menu>
    );
};

const ControlFAB: preact.FunctionalComponent<Props> = ({ children }) => {
    const [show, setShow] = useState(false);

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    return (
        <div class={style.control}>
            <Menu show={show} setShow={setShow}>
                {children}
            </Menu>
            <FAB icon={icon} label="Open Menu" onClick={() => setShow(!show)} />
        </div>
    );
};

export default ControlFAB;
