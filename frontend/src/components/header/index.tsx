import { Component, Fragment, h } from "preact";
import { Link } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import { AppStateActionType, Calculus, Theme } from "../../types/app";
import { useAppState } from "../../util/app-state";
import { classMap } from "../../util/class-map";
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
    /**
     * The current URL
     */
    currentUrl: string;
}

interface SingleLink {
    /**
     * The name for the link
     */
    name: string;
    /**
     * The path to which it links
     */
    path: string;
}

interface LinkGroup {
    /**
     * The name for the link group
     */
    name: string;
    /**
     * The routes of this group
     */
    routes: SingleLink[];
}

const ROUTES: LinkGroup[] = [
    {
        name: "Propositional",
        routes: [
            {
                name: "Tableaux",
                path: Calculus.propTableaux,
            },
            { name: "Resolution", path: Calculus.propResolution },
            { name: "DPLL", path: Calculus.dpll },
        ],
    },
    {
        name: "First Order",
        routes: [
            {
                name: "Tableaux",
                path: Calculus.foTableaux,
            },
            { name: "Resolution", path: Calculus.foResolution },
            { name: "NC Tableaux", path: Calculus.ncTableaux },
        ],
    },
];

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
            <Btn class={style.settingsBtn} onClick={toggle}>
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

interface NavProps {
    /**
     * Whether or not the hamburger is shown
     */
    hamburger: boolean;
    /**
     * Handler for clicking on links
     */
    onLinkClick: () => void;
    /**
     * The current URL
     */
    currentUrl: string;
}

const Nav: preact.FunctionalComponent<NavProps> = ({
    hamburger,
    onLinkClick,
    currentUrl,
}) => {
    return (
        <nav class={style.nav}>
            {ROUTES.map((r) => (
                <NavGroup
                    group={r}
                    onLinkClick={onLinkClick}
                    currentUrl={currentUrl}
                    hamburger={hamburger}
                />
            ))}
        </nav>
    );
};

interface NavGroupProps {
    /**
     * The group to render
     */
    group: LinkGroup;
    /**
     * Handler for clicking on links
     */
    onLinkClick: (e: MouseEvent) => void;
    /**
     * The current URL
     */
    currentUrl: string;
    /**
     * Whether or not the hamburger is shown
     */
    hamburger: boolean;
}

interface NavGroupState {
    /**
     * Whether the group is opened
     */
    open: boolean;
}

class NavGroup extends Component<NavGroupProps, NavGroupState> {
    public state = { open: false };

    public close = () => {
        this.setState({ open: false });
        return false;
    };

    public toggle = () => {
        this.setState({ open: !this.state.open });
        return false;
    };

    public handleClickOutside = ({ target }: MouseEvent) => {
        if (!this.state.open || !target) {
            return;
        }

        do {
            if (target === this.base) {
                return;
            }
            target = (target as any).parentNode;
        } while (target);
        this.close();
    };

    public componentDidMount() {
        addEventListener("click", this.handleClickOutside);
    }

    public componentWillUnmount() {
        removeEventListener("click", this.handleClickOutside);
    }

    public componentDidUpdate({ currentUrl, hamburger }: NavGroupProps) {
        if (currentUrl !== this.props.currentUrl && this.state.open) {
            this.close();
        }
        if (!this.state.open && hamburger) {
            this.setState({ open: true });
        }
    }

    public render(
        { group, onLinkClick, currentUrl, hamburger }: NavGroupProps,
        { open }: NavGroupState,
    ) {
        const isCurrent =
            !hamburger &&
            group.routes.find((r) => currentUrl.includes(r.path)) !== undefined;

        return (
            <div class={style.linkGroup}>
                {hamburger ? (
                    <p class={style.linkGroupName}>{group.name}</p>
                ) : (
                    <button
                        class={classMap({
                            [style.linkGroupBtn]: true,
                            [style.current]: isCurrent,
                        })}
                        onClick={this.toggle}
                    >
                        {group.name}
                    </button>
                )}
                <nav
                    class={classMap({
                        [style.linkGroupNav]: true,
                        [style.linkGroupNavOpen]: open,
                    })}
                    aria-label="submenu"
                    aria-hidden={`${!open}`}
                >
                    {group.routes.map((r) => (
                        <NavLink
                            link={r}
                            onClick={onLinkClick}
                            currentUrl={currentUrl}
                        />
                    ))}
                </nav>
            </div>
        );
    }
}

const NavLink: preact.FunctionalComponent<{
    link: SingleLink;
    onClick: (e: MouseEvent) => void;
    currentUrl: string;
}> = ({ link, onClick, currentUrl }) => (
    <Link
        href={`/${link.path}`}
        class={currentUrl.includes(link.path) ? style.current : undefined}
        onClick={onClick}
    >
        {link.name}
    </Link>
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
    /**
     * Whether to show the label
     */
    showLabel?: boolean;
    /**
     * Function for closing the surrounding dialog
     */
    close?: () => void;
}

const ServerInput: preact.FunctionalComponent<ServerInputProps> = ({
    showLabel = true,
    close,
}) => {
    const { dispatch, server } = useAppState();
    const [newServer, setServer] = useState(server);

    const dispatchServer = useCallback(() => {
        dispatch({
            type: AppStateActionType.SET_SERVER,
            value: newServer.trim(),
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
        [dispatchServer],
    );

    return (
        <div class={style.serverInputWrapper}>
            <div class={style.overlay} />
            <TextInput
                class={style.serverInput}
                label={showLabel ? "Server" : undefined}
                onChange={setServer}
                value={server}
                type="url"
                autoComplete={true}
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

export default Header;
