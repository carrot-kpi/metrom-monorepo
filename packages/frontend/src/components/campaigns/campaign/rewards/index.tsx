"use client";

import { Typography, Skeleton, Popover } from "@metrom-xyz/ui";
import { Status, type Rewards as RewardsType } from "@metrom-xyz/sdk";
import { SupportedChain } from "@metrom-xyz/contracts";
import { formatAmount, formatUsdAmount } from "@/src/utils/format";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RemoteLogo } from "@/src/components/remote-logo";
import classNames from "classnames";

import styles from "./styles.module.css";

interface RewardsProps {
    status: Status;
    daysDuration: number;
    rewards: RewardsType;
    chainId: SupportedChain;
}

export function Rewards({
    status,
    daysDuration,
    rewards,
    chainId,
}: RewardsProps) {
    const t = useTranslations("allCampaigns.rewards");

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [rewardsBreakdown, setRewardsBreakdown] =
        useState<HTMLDivElement | null>(null);
    const breakdownPopoverRef = useRef<HTMLDivElement>(null);

    const perDayUsdValue =
        daysDuration >= 1 ? rewards.amountUsdValue / daysDuration : 0;

    function handleRewardsBreakdownPopoverOpen() {
        setPopoverOpen(true);
    }

    function handleRewardsBreakdownPopoverClose() {
        setPopoverOpen(false);
    }

    return (
        <div className={styles.root}>
            <Popover
                open={popoverOpen}
                anchor={rewardsBreakdown}
                ref={breakdownPopoverRef}
                placement="top"
            >
                <div className={styles.breakdownContainer}>
                    <Typography size="sm" weight="medium" uppercase light>
                        {t("tooltip.rewards")}
                    </Typography>
                    {rewards.map((reward) => {
                        return (
                            <div
                                key={reward.token.address}
                                className={styles.breakdownRow}
                            >
                                <div>
                                    <RemoteLogo
                                        chain={chainId}
                                        size="sm"
                                        address={reward.token.address}
                                        defaultText={reward.token.symbol}
                                    />
                                    <Typography weight="medium" size="sm">
                                        {reward.token.symbol}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography weight="medium" size="sm">
                                        {formatAmount({
                                            amount: reward.amount.formatted,
                                        })}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                    <Typography weight="medium" size="sm" uppercase light>
                        {t("tooltip.totalUsdValue")}
                    </Typography>
                    <Typography size="lg" weight="medium">
                        {formatUsdAmount(rewards.amountUsdValue)}
                    </Typography>
                </div>
            </Popover>
            <div className={styles.rewardsWrapper}>
                <div
                    ref={setRewardsBreakdown}
                    onMouseEnter={handleRewardsBreakdownPopoverOpen}
                    onMouseLeave={handleRewardsBreakdownPopoverClose}
                    className={styles.tokenIcons}
                >
                    {rewards.map((reward, i) => {
                        return (
                            <div
                                key={reward.token.address}
                                className={styles.tokenIcon}
                                style={{ zIndex: i }}
                            >
                                <RemoteLogo
                                    chain={chainId}
                                    address={reward.token.address}
                                    defaultText={reward.token.symbol}
                                />
                            </div>
                        );
                    })}
                </div>
                <Typography weight="medium" className={styles.textRewards}>
                    {status === Status.Ended
                        ? "-"
                        : formatUsdAmount(perDayUsdValue)}
                </Typography>
            </div>
        </div>
    );
}

export function SkeletonRewards() {
    return (
        <div className={classNames(styles.rewardsWrapper, styles.loading)}>
            <div className={styles.tokenIcons}>
                {new Array(5).fill(null).map((_, i) => {
                    return (
                        <div key={i} className={styles.tokenIcon}>
                            <RemoteLogo loading />
                        </div>
                    );
                })}
            </div>
            <Skeleton className={styles.textRewards} />
        </div>
    );
}
