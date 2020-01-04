import { h } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.scss";

// Component used to display the navigation, projects logo and name
const Header: preact.FunctionalComponent = () => {
    return (
        <header class={style.header}>
            <a href="/" class={style.mainLink}>
                <img
                    class={style.logo}
                    src="/assets/icons/logo-plain.svg"
                    alt="KalkulierbaR logo"
                />
                <h1>KalkulierbaR</h1>
            </a>
            <div class={style.spacer} />
            <nav>
                <Link activeClassName={style.active} href="/prop-tableaux">
                    Tableaux
                </Link>
                <Link activeClassName={style.active} href="/prop-resolution">
                    Resolution
                </Link>
            </nav>
        </header>
    );
};

export default Header;
