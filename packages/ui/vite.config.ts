import { defineConfig } from "vite";
import {
    peerDependencies,
    dependencies,
    devDependencies,
} from "./package.json";

export default defineConfig({
    build: {
        cssCodeSplit: false,
        emptyOutDir: false,
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                ...Object.keys(peerDependencies),
                ...Object.keys(dependencies),
                ...Object.keys(devDependencies),
                "react/jsx-runtime",
            ],
            output: {
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
    },
});
