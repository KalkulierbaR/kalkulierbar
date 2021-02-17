import { h } from "preact";

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

const SendIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon size={size} fill={fill} d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
);

export default SendIcon;
