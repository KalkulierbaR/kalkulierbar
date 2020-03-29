import { h } from "preact";

import * as style from "./style.scss";
import { classMap } from "../../../util/class-map";

interface HamburgerProps {
    /**
     * Whether the hamburger menu is open
     */
    open: boolean;
    /**
     * Handler for click
     */
    onClick?: () => void;
}

const Hamburger: preact.FunctionalComponent<HamburgerProps> = ({
    open,
    onClick,
}) => (
    <div
        onClick={onClick}
        class={classMap({ [style.hamburgler]: true, [style.open]: open })}
    >
        <div class={style.hb1} />
        <div class={style.hb2} />
        <div class={style.hb3} />
    </div>
);

export default Hamburger;
