"use client";

import { usePrevious } from "react-use";
import { useTranslations } from "next-intl";
import type { SupportedChain } from "@metrom-xyz/contracts";
import { useCampaign } from "@/src/hooks/useCampaign";
import type { Hex } from "viem";
import { Header, SkeletonHeader } from "./header";
import { Details } from "./details";
import { Rewards } from "./rewards";
import { Leaderboard } from "./leaderboard";
import { KPI } from "@/src/commons/env";
import { Kpi } from "./kpi";
import { PageNotFound } from "../page-not-found";

import styles from "./styles.module.css";

interface CampaignDetailsProps {
    chain: SupportedChain;
    campaignId: Hex;
}

export function CampaignDetails({ chain, campaignId }: CampaignDetailsProps) {
    const t = useTranslations("campaignDetails");

    const { loading: loadingCampaign, campaign } = useCampaign(
        chain,
        campaignId,
    );

    const prevLoadingCampaign = usePrevious(loadingCampaign);
    if (prevLoadingCampaign && !loadingCampaign && !campaign)
        return <PageNotFound message={t("notFound")} />;

    return (
        <div className={styles.root}>
            <div className={styles.headerWrapper}>
                {!campaign || loadingCampaign ? (
                    <SkeletonHeader />
                ) : (
                    <Header campaign={campaign} />
                )}
            </div>
            <div className={styles.contentWrapper}>
                <Details campaign={campaign} loading={loadingCampaign} />
                <Rewards campaign={campaign} loading={loadingCampaign} />
                {KPI && <Kpi campaign={campaign} loading={loadingCampaign} />}
                <Leaderboard campaign={campaign} loading={loadingCampaign} />
            </div>
        </div>
    );
}
