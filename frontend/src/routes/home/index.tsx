import { h } from "preact";
import { Calculus } from "../../types/app";
import * as style from "./style.scss";

const Home: preact.FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <ul class={style.calculusList}>
                    <li class={style.calculusListItem}>
                        <a href={"/" + Calculus.propTableaux}>
                            Propositional Tableaux
                        </a>
                    </li>
                    <li class={style.calculusListItem}>
                        <a href={"/" + Calculus.foTableaux}>
                            First Order Tableaux
                        </a>
                    </li>
                    <li class={style.calculusListItem}>
                        <a href={"/" + Calculus.propResolution}>
                            Propositional Resolution
                        </a>
                    </li>
                    <li class={style.calculusListItem}>
                        <a href={"/" + Calculus.foResolution}>
                            First Order Resolution
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
