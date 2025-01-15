import { TextField, Typography } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import { formatPercentage, formatUsdAmount } from "@/src/utils/format";
import {
    CampaignType,
    KpiMetric,
    Status,
    type KpiSpecificationWithMeasurement,
} from "@metrom-xyz/sdk";
import { useMemo } from "react";
import { KpiSimulationChart } from "../../kpi-simulation-chart";
import { useKpiMeasurements } from "@/src/hooks/useKpiMeasurements";
import { DistributionChart } from "./distribution-chart";
import { AverageDistributionChart } from "./average-distribution-chart";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";

import styles from "./styles.module.css";

interface KpiProps {
    campaign?: NamedCampaign;
    loading: boolean;
}

export function Kpi({ campaign, loading }: KpiProps) {
    const t = useTranslations("campaignDetails.kpi");

    const specificationLoading = loading || !campaign;

    const { kpiMeasurements, loading: loadingKpiMeasurements } =
        useKpiMeasurements(campaign);

    const {
        goal: { lowerUsdTarget, upperUsdTarget },
        measurement,
        minimumPayoutPercentage,
    } = useMemo<KpiSpecificationWithMeasurement>(() => {
        if (!campaign?.specification?.kpi)
            return {
                goal: {
                    metric: KpiMetric.RangePoolTvl,
                    lowerUsdTarget: 0,
                    upperUsdTarget: 0,
                },
            };

        const { goal, measurement, minimumPayoutPercentage } =
            campaign.specification.kpi;

        return { goal, measurement, minimumPayoutPercentage };
    }, [campaign]);

    if (
        !campaign?.specification?.kpi ||
        campaign.type !== CampaignType.AmmPoolLiquidity
    )
        return null;

    const reachedGoalPercentage = measurement || 0;

    let poolUsdTvl;
    if (campaign.status === Status.Ended) {
        poolUsdTvl =
            loadingKpiMeasurements || kpiMeasurements.length === 0
                ? undefined
                : kpiMeasurements[kpiMeasurements.length - 1].value;
    } else {
        poolUsdTvl = campaign.target.usdTvl;
    }

    return (
        <div className={styles.root}>
            <Typography size="lg" weight="medium" uppercase>
                {t("title")}
            </Typography>
            <div className={styles.card}>
                <div className={styles.wrapper}>
                    <div className={styles.leftContentWrapper}>
                        <TextField
                            boxed
                            size="xl"
                            label={t("lowerBound")}
                            loading={specificationLoading}
                            value={formatUsdAmount(lowerUsdTarget)}
                        />
                        <TextField
                            boxed
                            size="xl"
                            label={t("upperBound")}
                            loading={specificationLoading}
                            value={formatUsdAmount(upperUsdTarget)}
                        />
                        <TextField
                            boxed
                            size="xl"
                            label={t("minimumPayout")}
                            loading={specificationLoading}
                            value={formatPercentage(
                                minimumPayoutPercentage
                                    ? minimumPayoutPercentage * 100
                                    : 0,
                            )}
                        />
                        <TextField
                            boxed
                            size="xl"
                            label={t("goalReached")}
                            loading={specificationLoading}
                            value={formatPercentage(
                                reachedGoalPercentage * 100,
                            )}
                        />
                    </div>
                    <div className={styles.chart}>
                        <Typography size="sm" uppercase light weight="medium">
                            {t("chart")}
                        </Typography>
                        <div className={styles.chartWrapper}>
                            <KpiSimulationChart
                                loading={specificationLoading}
                                poolUsdTvl={poolUsdTvl}
                                campaignEnded={campaign.status === Status.Ended}
                                totalRewardsUsd={
                                    campaign.rewards.amountUsdValue
                                }
                                lowerUsdTarget={lowerUsdTarget}
                                upperUsdTarget={upperUsdTarget}
                                minimumPayoutPercentage={
                                    minimumPayoutPercentage
                                }
                                className={styles.chartContainer}
                            />
                        </div>
                    </div>
                </div>
                {campaign.specification.kpi.measurement && (
                    <div className={styles.distributionChartsWrapper}>
                        <DistributionChart
                            chain={campaign.chainId}
                            loading={loadingKpiMeasurements}
                            kpiMeasurements={kpiMeasurements}
                            minimumPayoutPercentage={minimumPayoutPercentage}
                        />
                        <AverageDistributionChart
                            kpiMeasurementPercentage={
                                campaign.specification.kpi.measurement
                            }
                            minimumPayoutPercentage={
                                campaign.specification.kpi
                                    .minimumPayoutPercentage
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
