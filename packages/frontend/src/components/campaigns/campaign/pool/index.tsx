"use client";

import { Typography, Skeleton } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { formatPercentage } from "@/src/utils/format";
import { PoolRemoteLogo } from "@/src/components/pool-remote-logo";
import classNames from "classnames";
import { getCampaigPoolName } from "@/src/utils/campaign";
import { CampaignType } from "@metrom-xyz/sdk";

import styles from "./styles.module.css";

interface PoolProps {
    campaign: NamedCampaign;
}

export function Pool({ campaign }: PoolProps) {
    const t = useTranslations("allCampaigns.pool");

    if (campaign.type !== CampaignType.AmmPoolLiquidity) return null;

    return (
        <div className={styles.root}>
            <PoolRemoteLogo
                chain={campaign.chainId}
                tokens={campaign.target.tokens.map((token) => ({
                    address: token.address,
                    defaultText: token.symbol,
                }))}
            />
            <div className={styles.titleContainer}>
                <Typography size="lg" weight="medium" truncate>
                    {getCampaigPoolName(campaign)}
                </Typography>
                {campaign.target.fee && (
                    <Typography
                        size="sm"
                        weight="medium"
                        className={styles.campaignFee}
                        light
                    >
                        {formatPercentage(campaign.target.fee)}
                    </Typography>
                )}
                {campaign.specification?.kpi && (
                    <div className={styles.kpi}>
                        <Typography size="sm" weight="medium">
                            {t("kpi")}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
}

export function SkeletonPool() {
    return (
        <div className={styles.root}>
            <PoolRemoteLogo
                tokens={[{ address: "0x1" }, { address: "0x2" }]}
                loading
            />
            <div
                className={classNames(
                    styles.titleContainer,
                    styles.titleContainerLoading,
                )}
            >
                <Skeleton size="lg" width={120} />
                <Skeleton size="sm" width={50} className={styles.campaignFee} />
            </div>
        </div>
    );
}
