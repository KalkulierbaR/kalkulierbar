import { h } from "preact";

interface Props {
    /**
     * The video source
     */
    src: string;
    /**
     * An alternative text
     */
    alt: string;
    /**
     * An alternative text
     */
    type?: string;
    /**
     * Whether the video should start automatically
     */
    autoplay?: boolean;
    /**
     * Whether the video should play in a loop
     */
    loop?: boolean;
    /**
     * Whether the video should be muted
     */
    muted?: boolean;
}

const Video: preact.FunctionalComponent<Props> = ({
    src,
    alt,
    type = "video/mp4",
    autoplay = true,
    loop = true,
    muted = true,
}) => {
    return (
        <video
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            alt={alt}
        >
            <source
                src={src}
                type={type}
            />
        </video>
    );
};

export default Video;
