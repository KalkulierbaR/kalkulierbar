import { h } from "preact";
import * as style from "./style.css";

const Header: preact.FunctionalComponent = () => {
    return (
        <header class={style.header}>
            <img
                class={style.logo}
                src="/assets/icons/logo-plain.svg"
                alt="KalkulierbaR logo"
            />
            <h1>KalkulierbaR</h1>
        </header>
    );
};

export default Header;
