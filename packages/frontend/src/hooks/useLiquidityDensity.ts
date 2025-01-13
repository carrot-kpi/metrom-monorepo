import { type LiquidityDensity } from "@metrom-xyz/sdk";
import { metromApiClient } from "../commons";
import { useQuery } from "@tanstack/react-query";
import type { SupportedChain } from "@metrom-xyz/contracts";
import type { Pool } from "../../../sdk/dist/types";

const SURROUNDING_AMOUNT = 200;

export function useLiquidityDensity(
    pool?: Pool,
    chainId?: SupportedChain,
    enabled: boolean = true,
): {
    loading: boolean;
    liquidityDensity?: LiquidityDensity;
} {
    const { data, isPending } = useQuery({
        queryKey: ["ticks", chainId, pool],
        queryFn: async ({ queryKey }) => {
            const chainId = queryKey[1] as SupportedChain;
            if (!chainId) return undefined;

            const pool = queryKey[2] as Pool;
            if (!pool) return undefined;

            try {
                return metromApiClient.fetchLiquidityDensity({
                    chainId,
                    pool,
                    surroundingAmount: SURROUNDING_AMOUNT,
                });
            } catch (error) {
                throw new Error(
                    `Could not fetch initialized ticks for pool with address ${pool.address} in chain with id ${chainId}: ${error}`,
                );
            }
        },
        enabled: enabled && !!chainId && !!pool,
        refetchOnWindowFocus: false,
    });

    return {
        loading: isPending,
        liquidityDensity: data,
    };
}
