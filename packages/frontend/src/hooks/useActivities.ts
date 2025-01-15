import { type Activity } from "@metrom-xyz/sdk";
import { SupportedChain } from "@metrom-xyz/contracts";
import { metromApiClient } from "../commons";
import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

const TIME_RANGE = 60 * 60 * 24 * 7; // 1 week

// TODO: dynamic from and to
export function useActivities(): {
    loading: boolean;
    activities: Activity[];
} {
    const chainId: SupportedChain = useChainId();
    const { address } = useAccount();

    const { data: activities, isPending: loading } = useQuery({
        queryKey: ["activities", address, chainId],
        initialData: [],
        queryFn: async ({ queryKey }) => {
            const [_, account, chainId] = queryKey;
            if (!account || !chainId) return [];

            try {
                const to = Math.floor(Date.now() / 1000);
                const activities = await metromApiClient.fetchActivities({
                    chainId: chainId as SupportedChain,
                    address: account as Address,
                    from: to - TIME_RANGE,
                    to,
                });

                return activities;
            } catch (error) {
                throw new Error(
                    `Could not fetch activity for address ${address} in chain id ${chainId}: ${error}`,
                );
            }
        },
        enabled: !!chainId && !!address,
    });

    return {
        loading,
        activities: activities || [],
    };
}
