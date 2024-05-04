import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import sassDts from "vite-plugin-sass-dts";
import path from "path";

export default defineConfig({
    plugins: [
        preact({ devToolsEnabled: false }),
        sassDts({
            enabledMode: ["development", "production"],
            global: {
                generate: false,
                outputFilePath: path.resolve(__dirname, "./src/style.d.ts"),
            },
            sourceDir: path.resolve(__dirname, "./src"),
            outputDir: path.resolve(__dirname, "./src"),
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {},
        },
        modules: {
            scopeBehaviour: "local",
            localsConvention: "camelCase",
        },
    },
    build: {
        outDir: "build",
    },
});
