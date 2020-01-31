import { h } from "preact";
import { Calculus } from "../../types/app";
import * as style from "./style.scss";

interface Route {
    name: string;
    href: Calculus;
    imageURL: string;
}

const ROUTES: Route[] = [
    {
        href: Calculus.propTableaux,
        name: "Propositional Tableaux",
        imageURL: "/assets/calculi/prop-tab-dark.png"
    },
    {
        href: Calculus.foTableaux,
        name: "First Order Tableaux",
        imageURL: "/assets/calculi/fo-tab-dark.png"
    },
    {
        href: Calculus.propResolution,
        name: "Propositional Resolution",
        imageURL: "/assets/calculi/prop-res-dark.png"
    }
];

interface CalculusItemProps {
    route: Route;
}

const CalculusItem: preact.FunctionalComponent<CalculusItemProps> = ({
    route: { href, name, imageURL }
}) => {
    return (
        <div class={style.calculusItem}>
            <img class={style.calculusItemImage} src={imageURL} alt={name} />
            <a href={`/${href}`}>{name}</a>
        </div>
    );
};

const Home: preact.FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <div class={style.calculusGrid}>
                    {ROUTES.map(r => (
                        <CalculusItem route={r} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
