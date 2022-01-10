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

    const link = useRef<HTMLAnchorElement>(null);

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
            <div className="card" style="text-align: center;">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={style.sparkle}
                    viewBox="0 0 24 24"
                >
                    <path d="M11 6.999c2.395.731 4.27 2.607 4.999 5.001.733-2.395 2.608-4.269 5.001-5-2.393-.731-4.268-2.605-5.001-5-.729 2.394-2.604 4.268-4.999 4.999zm7 7c1.437.438 2.562 1.564 2.999 3.001.44-1.437 1.565-2.562 3.001-3-1.436-.439-2.561-1.563-3.001-3-.437 1.436-1.562 2.561-2.999 2.999zm-6 5.501c1.198.365 2.135 1.303 2.499 2.5.366-1.198 1.304-2.135 2.501-2.5-1.197-.366-2.134-1.302-2.501-2.5-.364 1.197-1.301 2.134-2.499 2.5zm-6.001-12.5c-.875 2.873-3.128 5.125-5.999 6.001 2.876.88 5.124 3.128 6.004 6.004.875-2.874 3.128-5.124 5.996-6.004-2.868-.874-5.121-3.127-6.001-6.001z" />
                </svg>
                check out{" "}
                <a
                    href="https://github.com/kalkulierbar/kalkulierbar"
                    target="_blank"
                >
                    KalkulierbaR on GitHub
                </a>{" "}
                or reach us at <a href="mailto:hi@kbar.app">hi@kbar.app</a>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={style.sparkle}
                    style="transform: scaleX(-1);"
                    viewBox="0 0 24 24"
                >
                    <path d="M11 6.999c2.395.731 4.27 2.607 4.999 5.001.733-2.395 2.608-4.269 5.001-5-2.393-.731-4.268-2.605-5.001-5-.729 2.394-2.604 4.268-4.999 4.999zm7 7c1.437.438 2.562 1.564 2.999 3.001.44-1.437 1.565-2.562 3.001-3-1.436-.439-2.561-1.563-3.001-3-.437 1.436-1.562 2.561-2.999 2.999zm-6 5.501c1.198.365 2.135 1.303 2.499 2.5.366-1.198 1.304-2.135 2.501-2.5-1.197-.366-2.134-1.302-2.501-2.5-.364 1.197-1.301 2.134-2.499 2.5zm-6.001-12.5c-.875 2.873-3.128 5.125-5.999 6.001 2.876.88 5.124 3.128 6.004 6.004.875-2.874 3.128-5.124 5.996-6.004-2.868-.874-5.121-3.127-6.001-6.001z" />
                </svg>
            </div>
        </div>
    );
};

export default Home;
