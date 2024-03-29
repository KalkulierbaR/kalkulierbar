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

const ThemeAuto: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff",
}) => (
    <svg
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
    >
        <g fill="none" fill-rule="evenodd">
            <path
                d="M58 60h10l-4.92-14L58 60zm1.564-22h8.975L82 74h-8.613l-2.45-7.4H56.934l-2.63 7.4H46l13.564-36z"
                fill={fill}
                fill-rule="nonzero"
            />
            <path
                d="M76.26 109.059H51.13M73.26 120.059H54.116"
                stroke={fill}
                stroke-width="8"
                stroke-linecap="square"
            />
            <path
                d="M46.14 84.21c-4.161-8.105-12.432-11.9-12.432-27.63 0-15.73 13.713-28.771 29.613-28.771s30.387 12.57 30.387 28.771c0 16.2-10.632 21.554-13.58 28.836-1.964 4.856-3.203 8.986-3.716 12.393H51.254c-.636-3.663-2.34-8.196-5.115-13.6z"
                stroke={fill}
                stroke-width="10"
            />
            <path
                d="M102 17.411l-5.412 5.77M115.94 56.431h-4.655M108 94.602l-6.607-4.941M22.557 19.758l6.74 6.38M8.759 55.861h7.478M20.682 94.607L26.346 90"
                stroke={fill}
                stroke-width="8"
                stroke-linecap="square"
            />
            <path
                fill={fill}
                fill-rule="nonzero"
                d="M67.212 1.962V15.55h-10V1.962z"
            />
        </g>
    </svg>
);

export default ThemeAuto;
