import { h } from "preact";
import { useState } from "preact/hooks";
import FAB from "../fab";
import CloseIcon from "../icons/close";

import MoreIcon from "../icons/more";
import * as style from "./style.scss";

interface Props {
    /**
     * Whether the FAB should start with the opened state
     */
    alwaysOpen?: boolean;
    /**
     * The components DOM children
     */
    children: any;
}

interface MenuProps {
    /**
     * Shows the menu.
     */
    show: boolean;
    /**
     * Handler for changing visibility.
     */
    setShow?: (v: boolean) => void;
    /**
     * The components DOM children
     */
    children: any;
}

const Menu: preact.FunctionalComponent<MenuProps> = ({
    show,
    children,
    setShow,
}) => {
    return (
        <menu
            class={style.menu + (show ? " " + style.show : "")}
            onClick={setShow ? () => setShow(false) : undefined}
        >
            {children}
        </menu>
    );
};

const ControlFAB: preact.FunctionalComponent<Props> = ({
    children,
    alwaysOpen = false,
}) => {
    const [show, setShow] = useState(alwaysOpen);

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    return (
        <div class={style.control}>
            <Menu show={show} setShow={alwaysOpen ? undefined : setShow}>
                {children}
            </Menu>
            <FAB icon={icon} label="Open Menu" onClick={() => setShow(!show)} />
        </div>
    );
};

export default ControlFAB;
