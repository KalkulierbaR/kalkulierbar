import { Fragment, h } from "preact";
import { Link } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import { useAppState } from "../../helpers/app-state";
import { classMap } from "../../helpers/class-map";
import { AppStateActionType, Theme } from "../../types/app";
import Btn from "../btn";
import Dialog from "../dialog";
import FAB from "../fab";
import RouterIcon from "../icons/router";
import SaveIcon from "../icons/save";
import ThemeAuto from "../icons/theme-auto";
import ThemeDark from "../icons/theme-dark";
import ThemeLight from "../icons/theme-light";
import TextInput from "../input/text";
import * as style from "./style.scss";

// Component used to display the navigation, projects logo and name
const Header: preact.FunctionalComponent = () => {
    const { smallScreen } = useAppState();
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(!open), [open]);
    const setDrawerClosed = () => setOpen(false);

    const right = smallScreen ? (
        <Hamburger open={open} onClick={toggle} />
    ) : (
        <Fragment>
            <Nav smallScreen={false} onLinkClick={setDrawerClosed} />
            <Settings smallScreen={false} />
        </Fragment>
    );

    return (
        <header class={classMap({ [style.header]: true, [style.open]: open })}>
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
            <Drawer open={open} onLinkClick={setDrawerClosed} />
        </header>
    );
};

interface HamburgerProps {
    open: boolean;
    onClick?: () => void;
}

const Hamburger: preact.FunctionalComponent<HamburgerProps> = ({
    open,
    onClick
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

interface NavProps {
    smallScreen: boolean;
    onLinkClick: CallableFunction;
}

const Nav: preact.FunctionalComponent<NavProps> = ({
    smallScreen,
    onLinkClick
}) => (
    <nav
        class={classMap({
            [style.nav]: true,
            [style.hamburgerLink]: smallScreen
        })}
    >
        <Link
            onClick={() => onLinkClick()}
            activeClassName={style.active}
            href="/prop-tableaux"
        >
            Tableaux
        </Link>
        <Link
            onClick={() => onLinkClick()}
            activeClassName={style.active}
            href="/prop-resolution"
        >
            Resolution
        </Link>
    </nav>
);

const Settings: preact.FunctionalComponent<{ smallScreen: boolean }> = ({
    smallScreen
}) => {
    const [show, setShow] = useState(false);

    return (
        <div class={style.settings}>
            <ThemeSwitcher smallScreen={smallScreen}/>
            {smallScreen && <ServerInput />}
            {!smallScreen && (
                <Fragment>
                    <Btn
                        onClick={() => setShow(!show)}
                        title="Change backend server"
                    >
                        <RouterIcon />
                    </Btn>
                    <Dialog
                        onClose={() => setShow(false)}
                        open={show}
                        label="Server"
                    >
                        <ServerInput
                            showLabel={false}
                            close={() => setShow(false)}
                        />
                    </Dialog>
                </Fragment>
            )}
        </div>
    );
};

interface ServerInputProps {
    showLabel?: boolean;
    close?: () => void;
}

const ServerInput: preact.FunctionalComponent<ServerInputProps> = ({
    showLabel = true,
    close
}) => {
    const { dispatch, server } = useAppState();
    const [newServer, setServer] = useState(server);

    return (
        <TextInput
            class={style.serverInput}
            label={showLabel ? "Server" : undefined}
            onChange={setServer}
            value={server}
            submitButton={
                <FAB
                    icon={<SaveIcon />}
                    label="Save Server URL"
                    mini={true}
                    onClick={() => {
                        dispatch({
                            type: AppStateActionType.SET_SERVER,
                            value: newServer
                        });
                        if (close) {
                            close();
                        }
                    }}
                />
            }
        />
    );
};

interface ThemeSwitcherProps {
    smallScreen: boolean;
}

const ThemeSwitcher: preact.FunctionalComponent<ThemeSwitcherProps> = ({smallScreen}) => {
    const { theme, dispatch } = useAppState();

    const onClick = () => {
        let newTheme: Theme;
        switch (theme) {
            case Theme.light:
                newTheme = Theme.auto;
                break;
            case Theme.dark:
                newTheme = Theme.light;
                break;
            case Theme.auto:
                newTheme = Theme.dark;
                break;
        }
        dispatch({ type: AppStateActionType.SET_THEME, value: newTheme });
    };

    const themeSwitcherIcon = () => {
        switch (theme) {
            case Theme.light:
                return <ThemeLight />;
            case Theme.dark:
                return <ThemeDark />;
            case Theme.auto:
                return <ThemeAuto />;
        }
    };

    return (
        <div onClick={onClick} class={style.themeContainer}>
            <Btn
                class={style.themeSwitcher}
                title="Change color scheme"
                id="theme-switcher"
            >
                {themeSwitcherIcon()}
            </Btn>
            {smallScreen ? <label style="cursor:pointer" for='theme-switcher'>&nbsp;&nbsp;Color theme</label> : ""}
        </div>
    );
};

interface DrawerProps {
    open: boolean;
    onLinkClick: CallableFunction;
}

const Drawer: preact.FunctionalComponent<DrawerProps> = ({
    open,
    onLinkClick
}) => (
    <div class={classMap({ [style.drawer]: true, [style.open]: open })}>
        <div class={style.inner}>
            <h3>Calculi</h3>
            <Nav smallScreen={true} onLinkClick={onLinkClick} />
            <h3>Settings</h3>
            <Settings smallScreen={true} />
        </div>
    </div>
);

export default Header;
