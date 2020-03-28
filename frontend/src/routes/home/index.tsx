import { h, VNode } from "preact";
import { Calculus } from "../../types/calculus";
import * as style from "./style.scss";

import ROUTES from "./routes";

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
}

const CalculusItem: preact.FunctionalComponent<CalculusItemProps> = ({
    route: { href, name, image, viewBox },
}) => {
    return (
        <a href={`/${href}`}>
            <div class={style.calculusItem}>
                <svg class={style.calculusItemImage} viewBox={viewBox}>
                    {image}
                </svg>
                <h3 class={style.calculusItemTitle}>{name}</h3>
            </div>
        </a>
    );
};

const Home: preact.FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <div class={style.calculusGrid}>
                    {ROUTES.map((r) => (
                        <CalculusItem route={r} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
