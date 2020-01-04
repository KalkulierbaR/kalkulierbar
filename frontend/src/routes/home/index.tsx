import { h } from "preact";
import * as style from "./style.scss";

/**
 * Properties Interface for the Home component
 */
interface Props {}

/*
 * The component displaying the content of the home route
 */
const Home: preact.FunctionalComponent<Props> = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <ul class={style.calculusList}>
                    <li class={style.calculusListItem}>
                        <a href="/prop-tableaux">Tableaux</a>
                    </li>
                    <li>
                        <a href="/prop-resolution">Resolution</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
