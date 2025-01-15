import { type Config } from "tailwindcss";
import { tailwindPreset } from "@metrom-xyz/ui";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    presets: [tailwindPreset],
    theme: {
        extend: {
            colors: {
                "safe-brand": "#12ff80",
            },
            transitionProperty: {
                colors: "border-radius, color, background-color, border-color, text-decoration-color, fill, stroke",
            },
            gridTemplateColumns: {
                "campaigns-table": "0.1fr 0.1fr 2fr 1.4fr 1fr 1fr",
                "rewards-mobile-table": "1.5fr 1fr 1fr",
            },
            backgroundImage: {
                dots:
                    "radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.8px, transparent 1px), " +
                    "radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.8px, transparent 1px)",
            },
        },
    },
};

export default config;
