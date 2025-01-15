import { Apr, SkeletonApr } from "./apr";
import { Pool, SkeletonPool } from "./pool";
import { SkeletonStatus, Status } from "./status";
import { Rewards, SkeletonRewards } from "./rewards";
import { Chain, SkeletonChain } from "./chain";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { Link } from "@/src/i18n/routing";
import { Card } from "@metrom-xyz/ui";
import classNames from "classnames";
import { Dex, SkeletonDex } from "./dex";
import { Points } from "./points";
import dayjs from "dayjs";

import styles from "./styles.module.css";

interface CampaignProps {
    campaign: NamedCampaign;
}

// TODO: reinstate the arrow on hover, but on click, bring the user
// to the provide liquidity page for the targeted dex
export function Campaign({ campaign }: CampaignProps) {
    const hoursDuration = dayjs
        .unix(campaign.to)
        .diff(dayjs.unix(campaign.from), "hours", false);
    const daysDuration = hoursDuration / 24;

    return (
        <Link href={`/campaigns/${campaign.chainId}/${campaign.id}`}>
            <Card className={classNames(styles.root, styles.noMobile)}>
                <Chain id={campaign.chainId} />
                <Dex campaign={campaign} />
                <div className={styles.poolContainer}>
                    <Pool campaign={campaign} />
                </div>
                <Status
                    from={campaign.from}
                    to={campaign.to}
                    status={campaign.status}
                />
                <Apr apr={campaign.apr} kpi={!!campaign.specification?.kpi} />
                {campaign.points && (
                    <Points
                        status={campaign.status}
                        amount={campaign.points}
                        daysDuration={daysDuration}
                    />
                )}
                {campaign.rewards.length > 0 && (
                    <Rewards
                        status={campaign.status}
                        daysDuration={daysDuration}
                        rewards={campaign.rewards}
                        chainId={campaign.chainId}
                    />
                )}
            </Card>
            <Card className={styles.mobileCard}>
                <div className={styles.topRow}>
                    <Chain id={campaign.chainId} />
                    <Dex campaign={campaign} />
                    <Pool campaign={campaign} />
                </div>
                <div className={styles.bottomRow}>
                    <Status
                        from={campaign.from}
                        to={campaign.to}
                        status={campaign.status}
                    />
                    <Apr
                        apr={campaign.apr}
                        kpi={!!campaign.specification?.kpi}
                    />
                    {campaign.points && (
                        <Points
                            status={campaign.status}
                            amount={campaign.points}
                            daysDuration={daysDuration}
                        />
                    )}
                    {campaign.rewards.length > 0 && (
                        <Rewards
                            status={campaign.status}
                            daysDuration={daysDuration}
                            rewards={campaign.rewards}
                            chainId={campaign.chainId}
                        />
                    )}
                </div>
            </Card>
        </Link>
    );
}

export function SkeletonCampaign() {
    return (
        <>
            <Card
                className={classNames(
                    styles.root,
                    styles.loading,
                    styles.noMobile,
                )}
            >
                <SkeletonChain />
                <SkeletonDex />
                <div className={styles.poolContainer}>
                    <SkeletonPool />
                </div>
                <SkeletonStatus />
                <SkeletonApr />
                <SkeletonRewards />
            </Card>
            <Card className={styles.mobileCard}>
                <div className={styles.topRow}>
                    <SkeletonChain />
                    <SkeletonDex />
                    <SkeletonPool />
                </div>
                <div className={styles.bottomRow}>
                    <SkeletonStatus />
                    <SkeletonApr />
                    <SkeletonRewards />
                </div>
            </Card>
        </>
    );
}
