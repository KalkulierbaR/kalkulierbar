import { h } from "preact";
import * as style from "./style.css";

const Btn: preact.FunctionalComponent<JSX.HTMLAttributes> = props => {
    return <button {...props} class={style.btn} />;
};

export default Btn;
