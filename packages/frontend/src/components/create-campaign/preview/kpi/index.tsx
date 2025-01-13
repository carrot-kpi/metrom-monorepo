import { Accordion, TextField, Typography } from "@metrom-xyz/ui";
import { KpiSimulationChart } from "@/src/components/kpi-simulation-chart";
import { useTranslations } from "next-intl";
import { formatPercentage, formatUsdAmount } from "@/src/utils/format";
import type { CampaignPayload } from "@/src/types";
import { useMemo } from "react";

import styles from "./styles.module.css";

interface KpiProps {
    poolUsdTvl?: number | null;
    rewards: CampaignPayload["tokens"];
    specification: CampaignPayload["kpiSpecification"];
}

export function Kpi({ poolUsdTvl, rewards, specification }: KpiProps) {
    const t = useTranslations("campaignPreview.kpi");

    const totalRewardsUsdAmount = useMemo(() => {
        if (!rewards) return 0;
        let total = 0;
        for (const reward of rewards) {
            if (!reward.amount.usdValue) return 0;
            total += reward.amount.usdValue;
        }
        return total;
    }, [rewards]);

    if (!specification) return null;

    const {
        goal: { lowerUsdTarget, upperUsdTarget },
        minimumPayoutPercentage,
    } = specification;

    return (
        <div className={styles.root}>
            <Typography uppercase weight="medium">
                {t("title")}
            </Typography>
            <div className={styles.header}>
                <TextField
                    boxed
                    size="xl"
                    label={t("lowerBound")}
                    value={formatUsdAmount(lowerUsdTarget)}
                />
                <TextField
                    boxed
                    size="xl"
                    label={t("upperBound")}
                    value={formatUsdAmount(upperUsdTarget)}
                />
                <TextField
                    boxed
                    size="xl"
                    label={t("minimumPayout")}
                    value={
                        minimumPayoutPercentage
                            ? formatPercentage(minimumPayoutPercentage * 100)
                            : "-"
                    }
                />
            </div>
            <Accordion title={t("simulation")} className={styles.chartWrapper}>
                <KpiSimulationChart
                    tooltipSize="xs"
                    poolUsdTvl={poolUsdTvl}
                    totalRewardsUsd={totalRewardsUsdAmount}
                    lowerUsdTarget={lowerUsdTarget}
                    upperUsdTarget={upperUsdTarget}
                    minimumPayoutPercentage={minimumPayoutPercentage}
                />
            </Accordion>
        </div>
    );
}
