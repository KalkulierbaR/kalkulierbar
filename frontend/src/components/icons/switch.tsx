import Icon from "./icon";

interface Props {
    /**
     * Width and height of the icon. Defaults to `24`.
     */
    size?: number;
    /**
     * The fill color to use. Defaults to `#fff`.
     */
    fill?: string;
}

const SwitchIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon
        size={size}
        fill={fill}
        d="M9.01,14H2v2h7.01v3L13,15l-3.99-4V14z M14.99,13v-3H22V8h-7.01V5L11,9L14.99,13z"
    />
);

export default SwitchIcon;
