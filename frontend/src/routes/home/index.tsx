import { h, VNode } from "preact";
import { useRef } from "preact/hooks";

import Switch from "../../components/input/switch";
import { Calculus } from "../../types/calculus";
import { setCalculusState } from "../../util/admin";
import { useAppState } from "../../util/app-state";

import ROUTES from "./routes";
import * as style from "./style.scss";

export interface Route {
    /**
     * Name of the route
     */
    name: string;
    /**
     * Link to the route
     */
    href: Calculus;
    /**
     * The SVG to display
     */
    image: VNode<any>;
    /**
     * The viewBox of the SVG
     */
    viewBox: string;
}

interface CalculusItemProps {
    /**
     * The route to render
     */
    route: Route;
    /**
     * Whether on/off switch should be shown
     */
    showSwitch?: boolean;
}

const CalculusItem: preact.FunctionalComponent<CalculusItemProps> = ({
    route: { href, name, image, viewBox },
    showSwitch = false,
}) => {
    const {
        config,
        server,
        notificationHandler,
        adminKey,
        setConfig,
    } = useAppState();

    const link = useRef<HTMLAnchorElement>();

    const handleChange = (checked: boolean) => {
        setCalculusState(
            server,
            href,
            checked,
            adminKey,
            setConfig,
            notificationHandler,
        );
    };

    return (
        <div
            class={style.calculusItem}
            onClick={(e) => {
                if (
                    !link.current ||
                    !e.target ||
                    (e.target as HTMLElement).tagName === "INPUT"
                ) {
                    return;
                }
            }}
        >
            <a href={`/${href}`} ref={link}>
                <svg class={style.calculusItemImage} viewBox={viewBox}>
                    {image}
                </svg>
            </a>
            <div
                class={`${style.calculusItemTitleWrapper} ${
                    showSwitch && style.calculusItemTitleWrapperShowSwitch
                }`}
            >
                <a href={`/${href}`}>
                    <h3 class={style.calculusItemTitle}>{name}</h3>
                </a>
                <span>
                    {showSwitch && (
                        <Switch
                            initialState={!config.disabled.includes(href)}
                            onChange={handleChange}
                        />
                    )}
                </span>
            </div>
        </div>
    );
};

const Home: preact.FunctionalComponent = () => {
    const { isAdmin, config } = useAppState();

    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <div class={style.calculusGrid}>
                    {ROUTES.map((r) =>
                        isAdmin ? (
                            <CalculusItem route={r} showSwitch={true} />
                        ) : config.disabled.includes(r.href) ? undefined : (
                            <CalculusItem route={r} />
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
