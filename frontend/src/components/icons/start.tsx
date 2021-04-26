import {h} from "preact";

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

const StartIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon size={size} fill={fill} d="M8 5v14l11-7z" />
);

export default StartIcon;
