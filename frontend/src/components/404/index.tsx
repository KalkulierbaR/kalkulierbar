import style from "./style.module.scss";

const Page404: preact.FunctionalComponent<{ default: boolean }> = () => (
    <div class="card">
        <h2 class={style.title}>Error 404</h2>
        <p class={style.large}>Looks like this page does not exists.</p>
        <p>
            You better head back <a href="/">Home</a>.
        </p>
    </div>
);

export default Page404;
