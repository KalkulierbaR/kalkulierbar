import { useCallback, useState } from "preact/hooks";

import Dialog from "../dialog";
import SettingsIcon from "../icons/settings";
import Btn from "../input/btn";

import Drawer from "./drawer";
import Hamburger from "./hamburger";
import Nav from "./nav";
import Settings from "./settings";

import * as style from "./style.module.scss";

interface HeaderProps {
    /**
     * The current URL
     */
    currentUrl: string;
}

const Header: preact.FunctionalComponent<HeaderProps> = ({ currentUrl }) => {
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(!open), [open]);
    const setClosed = useCallback(() => setOpen(false), [setOpen]);

    // FIXME: Adjust `smallScreen` or find another solution?
    const right =
        window.innerWidth < 950 ? (
            <Hamburger open={open} onClick={toggle} />
        ) : (
            <>
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
            </>
        );

    return (
        <header class={style.header}>
            <a href="/" class={style.mainLink} onClick={() => setOpen(false)}>
                <img
                    class={style.logo}
                    src="/icons/logo-plain.svg"
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
                // FIXME: Why 900?
                open={!(window.innerWidth < 900) && open}
                label="Settings"
                onClose={setClosed}
            >
                <Settings />
            </Dialog>
        </header>
    );
};

export default Header;
