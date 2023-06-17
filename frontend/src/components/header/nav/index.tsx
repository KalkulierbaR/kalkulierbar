import { Component } from "preact";

import { TableauxCalculusType } from "../../../types/calculus";
import { useAppState } from "../../../util/app-state";
import { classMap } from "../../../util/class-map";

import { LinkGroup, ROUTES, SingleLink } from "./routes";
import * as style from "./style.module.scss";

interface NavProps {
    /**
     * Whether the hamburger is shown
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
    const { config } = useAppState();

    return (
        <nav class={style.nav}>
            {ROUTES.map((r) => {
                const filteredRoutes = r.routes.filter((l) =>
                    config.disabled.includes(l.path as TableauxCalculusType),
                );

                return filteredRoutes.length === r.routes.length ? undefined : (
                    <NavGroup
                        group={r}
                        onLinkClick={onLinkClick}
                        currentUrl={currentUrl}
                        hamburger={hamburger}
                    />
                );
            })}
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
            target = (target as HTMLElement).parentNode;
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
        const { config } = useAppState();

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
                    {group.routes.map((r) =>
                        config.disabled.includes(
                            r.path as TableauxCalculusType,
                        ) ? undefined : (
                            <NavLink
                                link={r}
                                onClick={onLinkClick}
                                currentUrl={currentUrl}
                            />
                        ),
                    )}
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
    <a
        href={`/${link.path}`}
        class={currentUrl.includes(link.path) ? style.current : undefined}
        onClick={onClick}
    >
        {link.name}
    </a>
);

export default Nav;
