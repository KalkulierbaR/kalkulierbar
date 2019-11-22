import { h } from "preact";
import * as style from "./style.css";

// Interface for properties
interface Props {}

// This component is used to display the content of the home subpage
const Home: preact.FunctionalComponent<Props> = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Wähle ein Kalkül</h3>
                <ul>
                    <li>
                        <a href="/prop-tableaux">Tableaux</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
