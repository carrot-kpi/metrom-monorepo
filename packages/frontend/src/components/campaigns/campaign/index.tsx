import { Apr, SkeletonApr } from "./apr";
import { Pool, SkeletonPool } from "./pool";
import { SkeletonStatus, Status } from "./status";
import { Rewards, SkeletonRewards } from "./rewards";
import { Chain, SkeletonChain } from "./chain";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { Link } from "@/src/i18n/routing";
// import { ArrowRightIcon } from "@/src/assets/arrow-right-icon";

import styles from "./styles.module.css";

interface CampaignProps {
    campaign: NamedCampaign;
}

// TODO: reinstate the arrow on hover, but on click, bring the user
// to the provide liquidity page for the targeted dex
export function Campaign({ campaign }: CampaignProps) {
    return (
        <Link
            href={`/campaigns/${campaign.chainId}/${campaign.id}`}
            className={styles.root}
        >
            <Chain id={campaign.chainId} />
            <div className={styles.poolContainer}>
                <Pool campaign={campaign} />
                {/* <div className={styles.externalLink}>
                    <ArrowRightIcon className={styles.externalLinkIcon} />
                </div> */}
            </div>
            <Status
                from={campaign.from}
                to={campaign.to}
                status={campaign.status}
            />
            <Apr apr={campaign.apr} />
            <Rewards
                status={campaign.status}
                from={campaign.from}
                to={campaign.to}
                rewards={campaign.rewards}
                chainId={campaign.chainId}
            />
        </Link>
    );
}

export function SkeletonCampaign() {
    return (
        <div className={styles.root}>
            <SkeletonChain />
            <div className={styles.poolContainer}>
                <SkeletonPool />
            </div>
            <SkeletonStatus />
            <SkeletonApr />
            <SkeletonRewards />
        </div>
    );
}
