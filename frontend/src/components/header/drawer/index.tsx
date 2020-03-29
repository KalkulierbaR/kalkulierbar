import { h } from "preact";
import { classMap } from "../../../util/class-map";

import * as style from "./style.scss";
import Nav from "../nav";
import Settings from "../settings";

interface DrawerProps {
    /**
     * Whether the drawer is opened
     */
    open: boolean;
    /**
     * Handler for clicking on links
     */
    onLinkClick: () => void;
    /**
     * The current URL
     */
    currentUrl: string;
}

const Drawer: preact.FunctionalComponent<DrawerProps> = ({
    open,
    onLinkClick,
    currentUrl,
}) => (
    <div class={classMap({ [style.drawer]: true, [style.open]: open })}>
        <div class={style.inner}>
            <h3>Calculi</h3>
            <Nav
                hamburger={true}
                onLinkClick={onLinkClick}
                currentUrl={currentUrl}
            />
            <h3>Settings</h3>
            <Settings />
        </div>
    </div>
);

export default Drawer;
