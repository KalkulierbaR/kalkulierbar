import { h } from "preact";
import * as style from "./style.scss";

const Home: preact.FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <ul class={style.calculusList}>
                    <li class={style.calculusListItem}>
                        <a href="/prop-tableaux">Tableaux</a>
                    </li>
                    <li class={style.calculusListItem}>
                        <a href="/fo-tableaux">First Order Tableaux</a>
                    </li>
                    <li class={style.calculusListItem}>
                        <a href="/prop-resolution">Resolution</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
