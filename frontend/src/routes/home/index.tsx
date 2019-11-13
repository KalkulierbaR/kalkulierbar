import { h } from "preact";
import * as style from "./style.css";

// Interface for properties
interface Props {}

// This component is used to display the content of the home subpage
const Home: preact.FunctionalComponent<Props> = props => {
    let userInput: string = "";

    const onSubmit = (event: Event) => {
        event.preventDefault();
        alert("Submitted form with input: " + userInput);
    };

    const onInput = ({ target }: Event) => {
        const { value } = target as HTMLInputElement;
        userInput = value;
    };

    return (
        <div class={style.home}>
            <h3>Bitte gebe eine Klauselmenge ein:</h3>
            <form onSubmit={onSubmit}>
                <input type="text" value={userInput} onInput={onInput} />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Home;
