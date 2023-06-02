import * as style from "./style.module.scss";

interface Props {
    /**
     * The text for the tutorial
     */
    text: string;
    /**
     * The value for the css `bottom` property
     */
    bottom: string;
    /**
     * The value for the css `right` property
     */
    right: string;
}

const TutorialHint: preact.FunctionalComponent<Props> = ({
    text,
    bottom,
    right,
}) => {
    return (
        <div class={`card ${style.tut}`} style={{ bottom, right }}>
            <span>{text}</span>
            <svg
                class={style.svg}
                width={24}
                height={24}
                fill="var(--kbar-primary-text-color)"
                viewBox="0 0 24 24"
            >
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
            </svg>
        </div>
    );
};

export default TutorialHint;
