import { useCallback } from "react";
import { Skeleton, Typography, Button } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/routing";
import { ArrowRightIcon } from "@/src/assets/arrow-right-icon";
import {
    getPoolAddLiquidityLink,
    getAddressExplorerLink,
} from "@/src/utils/dex";
import { formatPercentage } from "@/src/utils/format";
import { trackFathomEvent } from "@/src/utils/fathom";
import { PoolRemoteLogo } from "../../pool-remote-logo";
import { AprChip } from "../../apr-chip";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { CampaignType } from "@metrom-xyz/sdk";

import styles from "./styles.module.css";

interface HeaderProps {
    campaign: NamedCampaign;
}

export function Header({ campaign }: HeaderProps) {
    const t = useTranslations("campaignDetails.header");
    const router = useRouter();

    const handleClaimOnClick = useCallback(() => {
        router.push("/claims");
    }, [router]);

    const depositLink = getPoolAddLiquidityLink(campaign);
    const explorerLink =
        campaign.type === CampaignType.AmmPoolLiquidity &&
        getAddressExplorerLink(campaign.target.address, campaign.chainId);

    function handleAddLiquidityOnClick() {
        trackFathomEvent("CLICK_POOL_DEPOSIT");
    }

    function handleExploreOnClick() {
        trackFathomEvent("CLICK_DEX_EXPLORE");
    }

    // TODO: implement header for different campaign types
    if (campaign.type !== CampaignType.AmmPoolLiquidity) return null;

    return (
        <div className={styles.root}>
            <div className={styles.titleContainer}>
                <div className={styles.title}>
                    <PoolRemoteLogo
                        chain={campaign.chainId}
                        size="xl"
                        tokens={campaign.target.tokens.map((token) => ({
                            address: token.address,
                            defaultText: token.symbol,
                        }))}
                    />
                    <Typography size="xl4" weight="medium">
                        {campaign.name}
                    </Typography>
                    {campaign.target.fee && (
                        <Typography size="lg" weight="medium" light>
                            {formatPercentage(campaign.target.fee)}
                        </Typography>
                    )}
                </div>
                <Typography size="sm" weight="medium" light>
                    {t("rewardsMayVary")}
                </Typography>
            </div>
            <div className={styles.actionsContainer}>
                <div className={styles.leftActions}>
                    <Button
                        size="sm"
                        href={depositLink}
                        disabled={!depositLink}
                        onClick={handleAddLiquidityOnClick}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("deposit")}
                    </Button>
                    {campaign.rewards.length > 0 && (
                        <Button size="sm" onClick={handleClaimOnClick}>
                            {t("claim")}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="secondary"
                        border={false}
                        icon={ArrowRightIcon}
                        href={explorerLink}
                        disabled={!explorerLink}
                        onClick={handleExploreOnClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={{
                            root: styles.exploreButton,
                            contentWrapper: styles.exploreButton,
                            icon: styles.externalLinkIcon,
                        }}
                    >
                        {t("explorer")}
                    </Button>
                </div>
                {campaign.apr && campaign.rewards.length > 0 && (
                    <AprChip
                        prefix
                        size="lg"
                        apr={campaign.apr}
                        kpi={!!campaign.specification?.kpi}
                    />
                )}
            </div>
        </div>
    );
}

export function SkeletonHeader() {
    const t = useTranslations("campaignDetails.header");

    return (
        <div className={styles.root}>
            <div className={styles.titleContainer}>
                <div className={styles.title}>
                    <PoolRemoteLogo
                        tokens={[{ address: "0x1" }, { address: "0x2" }]}
                        loading
                        size="xl"
                    />
                    <Skeleton size="xl4" width={400} />
                    <Skeleton size="lg" width={60} />
                </div>
                <Skeleton size="sm" width={125} />
            </div>
            <div className={styles.actionsContainer}>
                <div className={styles.leftActions}>
                    <Button size="sm" loading>
                        {t("deposit")}
                    </Button>
                    <Button size="sm" loading>
                        {t("claim")}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        border={false}
                        loading
                    >
                        {t("explorer")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
