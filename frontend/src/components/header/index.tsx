import {Fragment, h} from "preact";
import {Link} from "preact-router";
import {useCallback, useState} from "preact/hooks";
import { useAppState } from "../../helpers/app-state";
import { classMap } from "../../helpers/class-map";
import {AppStateActionType, Calculus, Theme} from "../../types/app";
import Btn from "../btn";
import Dialog from "../dialog";
import FAB from "../fab";
import SaveIcon from "../icons/save";
import SettingsIcon from "../icons/settings";
import ThemeAuto from "../icons/theme-auto";
import ThemeDark from "../icons/theme-dark";
import ThemeLight from "../icons/theme-light";
import TextInput from "../input/text";
import * as style from "./style.scss";

interface HeaderProps {
    currentUrl: string;
}

const Header: preact.FunctionalComponent<HeaderProps> = ({currentUrl}) => {
    const { smallScreen } = useAppState();
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(!open), [open]);
    const setClosed = useCallback(() => setOpen(false), [open]);

    const right = smallScreen ? (
        <Hamburger open={open} onClick={toggle} />
    ) : (
        <Fragment>
            <Nav
                smallScreen={false}
                onLinkClick={setClosed}
                currentUrl={currentUrl}
            />
            <Btn class={style.settingsBtn} onClick={toggle} >
                <SettingsIcon />
            </Btn>
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
    currentUrl: string;
}

const Nav: preact.FunctionalComponent<NavProps> = ({
    smallScreen,
    onLinkClick,
    currentUrl,
}) => (
        <nav
            class={classMap({
                [style.nav]: true,
                [style.hamburgerLink]: smallScreen
            })}
        >
            <Link
                    onClick={() => onLinkClick()}
                    class={currentUrl.includes(Calculus.propTableaux) ? style.current : undefined}
                    href={"/" + Calculus.propTableaux}
                >
                    Propositional Tableaux
                </Link>
                <Link
                    onClick={() => onLinkClick()}
                    class={currentUrl.includes(Calculus.foTableaux) ? style.current : undefined}
                    href={"/" + Calculus.foTableaux}
                >
                    First Order Tableaux
                </Link>
            <Link
                onClick={() => onLinkClick()}
                class={currentUrl.includes(Calculus.propResolution) ? style.current : undefined}
                href={"/" + Calculus.propResolution}
            >
                Propositional Resolution
            </Link>
        </nav>
);

const Settings: preact.FunctionalComponent = () => {
    return (
        <div class={style.settings}>
            <ThemeSwitcher />
            <ServerInput />
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

    const dispatchServer = useCallback(() => {
        dispatch({
            type: AppStateActionType.SET_SERVER,
            value: newServer
        });
    }, [newServer]);

    const onSubmit = useCallback(() => {
        dispatchServer();
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
        if (close) {
            close();
        }
    }, [dispatchServer]);

    const handleEnter = useCallback(
        (e: KeyboardEvent) => {
            if (e.keyCode === 13) {
                onSubmit();
            }
        },
        [dispatchServer]
    );

    return (
        <div class={style.serverInputWrapper}>
            <div class={style.overlay} />
            <TextInput
                class={style.serverInput}
                label={showLabel ? "Server" : undefined}
                onChange={setServer}
                value={server}
                onKeyDown={handleEnter}
                submitButton={
                    <FAB
                        icon={<SaveIcon />}
                        label="Save Server URL"
                        mini={true}
                        onClick={onSubmit}
                    />
                }
            />
        </div>
    );
};

const ThemeSwitcher: preact.FunctionalComponent = () => {
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
                title="Change color theme"
                id="theme-switcher"
            >
                {themeSwitcherIcon()}
            </Btn>
            <label for="theme-switcher">Current theme: {theme}</label>
        </div>
    );
};

interface DrawerProps {
    open: boolean;
    onLinkClick: CallableFunction;
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
                smallScreen={true}
                onLinkClick={onLinkClick}
                currentUrl={currentUrl}
            />
            <h3>Settings</h3>
            <Settings />
        </div>
    </div>
);

export default Header;
