import {
    CampaignType,
    SupportedDex,
    type Campaign,
    type Pool,
} from "@metrom-xyz/sdk";
import { SupportedChain } from "@metrom-xyz/contracts";
import type { Dex } from "../types";
import { CHAIN_DATA } from "../commons";
import type { Hex } from "viem";
import type { Address } from "blo";

export function getDex(
    chainId: SupportedChain,
    dexSlug: string,
): Dex | undefined {
    return CHAIN_DATA[chainId].dexes.find((dex) => dex.slug === dexSlug);
}

export function getPoolAddLiquidityLink(
    campaign: Campaign,
): string | undefined {
    if (campaign.type !== CampaignType.AmmPoolLiquidity) return undefined;

    const { chainId, target } = campaign;

    const dex = getDex(chainId, target.dex);
    if (!dex || !dex.addLiquidityUrl) return;

    if ([SupportedDex.UniswapV3, SupportedDex.Panko].includes(dex.slug))
        return dex.addLiquidityUrl.replace(
            "{target_pool}",
            `${target.tokens.map((token) => token.address).join("/")}`,
        );

    return dex.addLiquidityUrl.replace("{target_pool}", `${target.address}`);
}

export function getAddressExplorerLink(campaign: Campaign): string | undefined {
    if (campaign.type !== CampaignType.AmmPoolLiquidity) return undefined;

    const { chainId, target } = campaign;
    if (!chainId) return;

    const explorer = CHAIN_DATA[chainId].blockExplorers?.default;
    if (!explorer) return;

    return `${explorer.url}/address/${target.address}`;
}

export function getTxExplorerLink(
    hash: Hex,
    chainId?: SupportedChain,
): string | undefined {
    if (!chainId) return;

    const explorer = CHAIN_DATA[chainId].blockExplorers?.default;
    if (!explorer) return;

    return `${explorer.url}/tx/${hash}`;
}
