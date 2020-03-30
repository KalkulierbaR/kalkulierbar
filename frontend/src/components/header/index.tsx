import { Fragment, h } from "preact";
import { useCallback, useState } from "preact/hooks";
import { useAppState } from "../../util/app-state";
import Btn from "../btn";
import Dialog from "../dialog";
import SettingsIcon from "../icons/settings";
import * as style from "./style.scss";
import Nav from "./nav";
import Drawer from "./drawer";
import Settings from "./settings";
import Hamburger from "./hamburger";

interface HeaderProps {
    /**
     * The current URL
     */
    currentUrl: string;
}

const Header: preact.FunctionalComponent<HeaderProps> = ({ currentUrl }) => {
    const { smallScreen } = useAppState();
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(!open), [open]);
    const setClosed = useCallback(() => setOpen(false), [setOpen]);

    const right = smallScreen ? (
        <Hamburger open={open} onClick={toggle} />
    ) : (
        <Fragment>
            <Nav
                hamburger={false}
                onLinkClick={setClosed}
                currentUrl={currentUrl}
            />
            <Btn
                className={style.settingsBtn}
                onClick={toggle}
                icon={<SettingsIcon />}
            />
        </Fragment>
    );

    return (
        <header class={style.header}>
            <a href="/" class={style.mainLink}>
                <img
                    class={style.logo}
                    src="/assets/icons/logo-plain.svg"
                    alt="KalkulierbaR logo"
                />
                <h1>KalkulierbaR</h1>
            </a>
            <div class={style.spacer} />
            {right}
            <Drawer
                open={open}
                onLinkClick={setClosed}
                currentUrl={currentUrl}
            />
            <Dialog
                class={style.dialog}
                open={!smallScreen && open}
                label="Settings"
                onClose={setClosed}
            >
                <Settings />
            </Dialog>
        </header>
    );
};

export default Header;
