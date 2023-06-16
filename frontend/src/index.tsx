import "./style/index.scss";
import { render } from "preact";
import App from "./components/app";

render(<App />, document.getElementById("app") as HTMLElement);
