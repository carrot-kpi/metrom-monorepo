import { type Tick } from "@metrom-xyz/sdk";
import { metromApiClient } from "../commons";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useChainId } from "wagmi";

const SURROUNDING_AMOUNT = 200;

export function useTicks(poolAddress?: Address): {
    loading: boolean;
    ticks: Tick[];
} {
    const chainId = useChainId();

    const { data, isPending } = useQuery({
        queryKey: ["ticks", chainId, poolAddress],
        queryFn: async ({ queryKey }) => {
            const chainId = queryKey[1] as number;
            if (!chainId) return [];

            const poolAddress = queryKey[2] as Address;
            if (!poolAddress) return [];

            try {
                return metromApiClient.fetchTicks({
                    chainId,
                    poolAddress,
                    surroundingAmount: SURROUNDING_AMOUNT,
                });
            } catch (error) {
                throw new Error(
                    `Could not fetch initialized ticks for pool with address ${poolAddress} in chain with id ${chainId}: ${error}`,
                );
            }
        },
        enabled: !!chainId && !!poolAddress,
        refetchOnWindowFocus: false,
    });

    return {
        loading: isPending,
        ticks: data || [],
    };
}
