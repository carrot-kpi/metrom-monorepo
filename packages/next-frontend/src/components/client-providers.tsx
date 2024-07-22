"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { type ReactNode } from "react";
import {
    getDefaultConfig,
    RainbowKitProvider,
    type Locale,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { SUPPORTED_CHAINS } from "@/utils/commons";

const config = getDefaultConfig({
    appName: "Metrom",
    // TODO: actually set a project id here
    projectId: "YOUR_PROJECT_ID",
    chains: SUPPORTED_CHAINS,
    ssr: true,
});

const queryClient = new QueryClient();

export function ClientProviders({
    locale,
    children,
}: Readonly<{
    locale: Locale;
    children: ReactNode;
}>) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={{
                        appName: "Metrom",
                        learnMoreUrl: "https://www.metrom.xyz",
                    }}
                    locale={locale}
                    theme={darkTheme({
                        // TODO: add primary color
                        accentColor: "#48D080",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}