import { h } from "preact";
import { AppStateUpdater } from "../../../types/app";
import { TableauxState } from "../../../types/tableaux";
import * as style from "./style.css";

interface Props {
    state?: TableauxState;
    onChange: AppStateUpdater<"prop-tableaux">;
}

const TableauxView: preact.FunctionalComponent<Props> = ({ state }) => {
    console.log(state);
    return <div class={style.view}>Tableaux View</div>;
};

export default TableauxView;
