import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
            },
            {
                protocol: "https",
                hostname: "assets.coingecko.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/manifest.json",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-Requested-With, content-type, Authorization",
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
