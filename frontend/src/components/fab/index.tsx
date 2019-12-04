import { h } from "preact";
import * as style from "./style.css";

interface Props {}

const FAB: preact.FunctionalComponent<Props> = ({ children }) => {
    return <button class={style.fab}>{children}</button>;
};

export default FAB;
