import { h } from "preact";
import * as style from "./style.css";

// Interface for properties
interface Props {
    calculus: string;
    server: string;
}

// This component is used to display the content of the home subpage
const Home: preact.FunctionalComponent<Props> = ({ calculus, server }) => {
    let userInput: string = "";
    const url = `${server}/${calculus}/parse`;

    const onSubmit = async (event: Event) => {
        event.preventDefault();
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `formula=${userInput}`
        });
        const parsed = await response.text();
        console.log(parsed);
    };

    const onInput = ({ target }: Event) => {
        const { value } = target as HTMLInputElement;
        userInput = value;
    };

    return (
        <div class={style.home}>
            <h3>Bitte gebe eine Klauselmenge ein:</h3>
            <form onSubmit={onSubmit}>
                <input
                    name="formula"
                    type="text"
                    value={userInput}
                    onInput={onInput}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Home;
