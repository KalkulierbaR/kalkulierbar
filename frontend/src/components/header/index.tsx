import { Fragment, h } from "preact";
import { Link } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import { useAppState } from "../../helpers/app-state";
import { classMap } from "../../helpers/class-map";
import { AppStateActionType, Theme } from "../../types/app";
import Btn from "../btn";
import Dialog from "../dialog";
import FAB from "../fab";
import SaveIcon from "../icons/save";
import TextInput from "../input/text";
import * as style from "./style.scss";

// Component used to display the navigation, projects logo and name
const Header: preact.FunctionalComponent = () => {
    const { smallScreen } = useAppState();
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(!open), [open]);

    const right = smallScreen ? (
        <Hamburgler open={open} onClick={toggle} />
    ) : (
        <Fragment>
            <Settings smallScreen={false} />
            <Nav />
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
            <Drawer open={open} />
        </header>
    );
};

interface HamburglerProps {
    open: boolean;
    onClick?: () => void;
}

const Hamburgler: preact.FunctionalComponent<HamburglerProps> = ({
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

const Nav: preact.FunctionalComponent = () => (
    <nav class={style.nav}>
        <Link activeClassName={style.active} href="/prop-tableaux">
            Tableaux
        </Link>
        <Link activeClassName={style.active} href="/prop-resolution">
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
            <ThemeSwitcher />
            {smallScreen && <ServerInput />}
            {!smallScreen && (
                <Btn onClick={() => setShow(!show)}>
                    <SaveIcon />
                    <Dialog
                        onClose={() => setShow(false)}
                        open={show}
                        label="Server"
                    >
                        <ServerInput showLabel={false} />
                    </Dialog>
                </Btn>
            )}
        </div>
    );
};

interface ServerInputProps {
    showLabel?: boolean;
}

const ServerInput: preact.FunctionalComponent<ServerInputProps> = ({
    showLabel = true
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
                    onClick={() =>
                        dispatch({
                            type: AppStateActionType.SET_SERVER,
                            value: newServer
                        })
                    }
                />
            }
        />
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

    return (
        <div class={style.themeContainer}>
            <button
                onClick={onClick}
                class={style.themeSwitcher}
                title="Change color scheme"
                id="theme-switcher"
            >
                <img src={`/assets/theme-${theme}.svg`} alt="Theme" />
            </button>
            <label for="theme-switcher">Theme</label>
        </div>
    );
};

interface DrawerProps {
    open: boolean;
}

const Drawer: preact.FunctionalComponent<DrawerProps> = ({ open }) => (
    <div class={classMap({ [style.drawer]: true, [style.open]: open })}>
        <div class={style.inner}>
            <h3>Calculi</h3>
            <Nav />
            <h3>Settings</h3>
            <Settings smallScreen={true} />
        </div>
    </div>
);

export default Header;
