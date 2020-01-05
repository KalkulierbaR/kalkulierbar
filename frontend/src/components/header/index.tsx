import { Fragment, h } from "preact";
import { Link } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import { useAppState } from "../../helpers/app-state";
import { classMap } from "../../helpers/class-map";
import { AppStateActionType, Theme } from "../../types/app";
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
            <Settings />
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

const Settings: preact.FunctionalComponent = () => {
    return (
        <div class={style.settings}>
            <ThemeSwitcher />
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
            <Settings />
        </div>
    </div>
);

export default Header;
