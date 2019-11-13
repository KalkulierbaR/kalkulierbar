import { h } from "preact";
import * as style from "./style.css";

// Interface for properties
interface Props {}

// This component is used to display the content of the home subpage
const Home: preact.FunctionalComponent<Props> = props => {
    return (
        <div class={style.home}>
            <h1>Home</h1>
        </div>
    );
};

export default Home;
