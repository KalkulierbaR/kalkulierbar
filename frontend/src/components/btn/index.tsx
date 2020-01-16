import { h } from "preact";
import * as style from "./style.scss";

const Btn: preact.FunctionalComponent<JSX.HTMLAttributes> = props => {
    return <button {...props} class={`${style.btn} ${props.class}`} />;
};

export default Btn;
