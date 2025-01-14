import { CampaignType, type Campaign } from "@metrom-xyz/sdk";
import { CHAIN_DATA } from "../commons";
import type { CampaignPayload } from "../types";

const SECONDS_IN_YEAR = 60 * 60 * 24 * 365;

const SUPPORTED_DEX_SLUG_TO_NAME = Object.values(CHAIN_DATA).reduce(
    (acc: Record<string, string>, chainData) => {
        for (const dex of chainData.dexes) acc[dex.slug] = dex.name;
        return acc;
    },
    {},
);

export const getCampaignName = (campaign: Campaign) => {
    // TODO: handle other campaign types
    if (campaign.type === CampaignType.AmmPoolLiquidity)
        return `${SUPPORTED_DEX_SLUG_TO_NAME[campaign.target.dex] || "-"} ${getCampaigPoolName(campaign)}`;
    return "";
};

export const getCampaigPoolName = (campaign: Campaign) => {
    // TODO: handle other campaign types
    if (campaign.type === CampaignType.AmmPoolLiquidity)
        return `${campaign.target.tokens.map((token) => token.symbol).join(" / ")}`;
    return "";
};

export const getCampaignPreviewApr = (campaign: CampaignPayload) => {
    if (
        !campaign.tokens ||
        !campaign.pool?.usdTvl ||
        !campaign.startDate ||
        !campaign.endDate
    )
        return null;

    let rewardsUsdValue = 0;
    for (const reward of campaign.tokens) {
        if (!reward.amount.usdValue) return null;
        rewardsUsdValue += reward.amount.usdValue;
    }

    const duration = campaign.endDate.unix() - campaign.startDate.unix();
    if (duration <= 0) return null;

    const rewardsTvlRatio = rewardsUsdValue / campaign.pool.usdTvl;
    const yearMultiplier = SECONDS_IN_YEAR / duration;
    const apr = rewardsTvlRatio * yearMultiplier * 100;

    return apr || null;
};
