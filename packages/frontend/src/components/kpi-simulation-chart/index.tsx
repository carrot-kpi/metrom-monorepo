import {
    Area,
    CartesianGrid,
    ComposedChart,
    ReferenceDot,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ErrorText, Typography } from "@metrom-xyz/ui";
import { TvlTick } from "./axis-ticks/tvl";
import { RewardTick } from "./axis-ticks/reward";
import { TooltipContent, TooltipCursor } from "./tooltip";
import { getDistributableRewardsPercentage } from "@/src/utils/kpi";
import classNames from "classnames";

import styles from "./styles.module.css";

export interface DistributedAreaDataPoint {
    usdTvl: number;
    currentlyDistributing: number;
    currentlyNotDistributing: number;
}

interface KpiSimulationChartProps {
    minimumPayoutPercentage?: number;
    lowerUsdTarget?: number;
    upperUsdTarget?: number;
    totalRewardsUsd: number;
    poolUsdTvl?: number | null;
    error?: boolean;
    loading?: boolean;
    className?: string;
}

const POINTS_COUNT = 1000;
// const BASE_HEIGHT = 270;
export const CHART_MARGINS = { top: 30, right: 4, bottom: 18, left: 2 };

export function KpiSimulationChart({
    minimumPayoutPercentage = 0,
    lowerUsdTarget,
    upperUsdTarget,
    totalRewardsUsd,
    poolUsdTvl,
    error,
    loading,
    className,
}: KpiSimulationChartProps) {
    const t = useTranslations("simulationChart");

    const currentPayoutUsd =
        poolUsdTvl && lowerUsdTarget && upperUsdTarget
            ? totalRewardsUsd *
              getDistributableRewardsPercentage(
                  poolUsdTvl,
                  lowerUsdTarget,
                  upperUsdTarget,
                  minimumPayoutPercentage,
              )
            : 0;

    const sortedSignificantUsdTvls = useMemo(() => {
        if (
            lowerUsdTarget === undefined ||
            upperUsdTarget === undefined ||
            poolUsdTvl === null ||
            poolUsdTvl === undefined
        )
            return [];

        const tvls = [poolUsdTvl, lowerUsdTarget, upperUsdTarget];
        tvls.sort();

        return [tvls[0] * 0.9, ...tvls, tvls[2] * 1.1];
    }, [lowerUsdTarget, poolUsdTvl, upperUsdTarget]);

    const areaChartData: DistributedAreaDataPoint[] = useMemo(() => {
        if (
            upperUsdTarget === undefined ||
            lowerUsdTarget === undefined ||
            poolUsdTvl === null ||
            poolUsdTvl === undefined ||
            sortedSignificantUsdTvls.length === 0
        )
            return [];

        const lowerUsdTvl = sortedSignificantUsdTvls[0];
        const upperUsdTvl = sortedSignificantUsdTvls[4];
        const usdTvlRange = upperUsdTvl - lowerUsdTvl;
        const domainStep = usdTvlRange / POINTS_COUNT;

        const points: DistributedAreaDataPoint[] = [];
        for (
            let usdTvl = lowerUsdTvl;
            usdTvl <= upperUsdTvl;
            usdTvl += domainStep
        ) {
            const distributedRewards =
                totalRewardsUsd *
                getDistributableRewardsPercentage(
                    usdTvl,
                    lowerUsdTarget,
                    upperUsdTarget,
                    minimumPayoutPercentage,
                );

            points.push({
                usdTvl,
                currentlyDistributing:
                    usdTvl <= poolUsdTvl ? distributedRewards : 0,
                currentlyNotDistributing:
                    usdTvl > poolUsdTvl ? distributedRewards : 0,
            });
        }

        return points;
    }, [
        lowerUsdTarget,
        minimumPayoutPercentage,
        poolUsdTvl,
        sortedSignificantUsdTvls,
        totalRewardsUsd,
        upperUsdTarget,
    ]);

    if (
        upperUsdTarget === undefined ||
        lowerUsdTarget === undefined ||
        poolUsdTvl === null ||
        poolUsdTvl === undefined
    )
        return (
            <div className={classNames("root", styles.root, className)}>
                <div
                    className={classNames(
                        "emptyContainer",
                        styles.emptyContainer,
                    )}
                >
                    {error ? (
                        <ErrorText
                            variant="xs"
                            weight="medium"
                            className={styles.errorText}
                        >
                            {t("errors.missingData")}
                        </ErrorText>
                    ) : (
                        <Typography
                            uppercase
                            variant="sm"
                            light
                            weight="medium"
                        >
                            {t("emptyData")}
                        </Typography>
                    )}
                </div>
            </div>
        );

    if (error) {
        return (
            <div className={classNames("root", styles.root, className)}>
                <div
                    className={classNames(
                        "emptyContainer",
                        styles.emptyContainer,
                    )}
                >
                    <ErrorText
                        variant="xs"
                        weight="medium"
                        className={styles.errorText}
                    >
                        {t("errors.wrongData")}
                    </ErrorText>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={classNames("root", styles.root, className)}>
                <div
                    className={classNames(
                        "emptyContainer",
                        styles.emptyContainer,
                        styles.loading,
                    )}
                ></div>
            </div>
        );
    }

    return (
        <div className={classNames("root", styles.root, className)}>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container)}
            >
                <ComposedChart
                    data={areaChartData}
                    margin={CHART_MARGINS}
                    style={{ cursor: "pointer" }}
                >
                    <XAxis
                        type="number"
                        format="number"
                        dataKey="usdTvl"
                        tick={
                            <TvlTick
                                poolUsdTvl={poolUsdTvl}
                                lowerUsdTarget={lowerUsdTarget}
                                upperUsdTarget={upperUsdTarget}
                            />
                        }
                        ticks={[upperUsdTarget, poolUsdTvl, lowerUsdTarget]}
                        domain={["dataMin", "dataMax"]}
                    />
                    <YAxis
                        type="number"
                        format="number"
                        axisLine={false}
                        tickLine={false}
                        mirror
                        tick={<RewardTick />}
                        domain={[0, "dataMax"]}
                        ticks={[currentPayoutUsd, totalRewardsUsd]}
                    />

                    <Area
                        type="monotone"
                        dataKey="currentlyDistributing"
                        fill="#6CFF95"
                        stroke="none"
                        fillOpacity={1}
                        animationEasing="ease-in-out"
                        animationDuration={200}
                        isAnimationActive={true}
                        activeDot={false}
                    />

                    <Area
                        type="monotone"
                        dataKey="currentlyNotDistributing"
                        fill="#d1d5db"
                        stroke="none"
                        fillOpacity={1}
                        animationEasing="ease-in-out"
                        animationDuration={200}
                        isAnimationActive={true}
                        activeDot={false}
                    />

                    <ReferenceLine
                        strokeDasharray={"3 3"}
                        ifOverflow="visible"
                        isFront
                        stroke="#6CFF95"
                        segment={[
                            {
                                x: sortedSignificantUsdTvls[1],
                                y: 0,
                            },
                            {
                                x: sortedSignificantUsdTvls[3],
                                y: totalRewardsUsd,
                            },
                        ]}
                    />

                    <ReferenceLine
                        strokeDasharray={"3 3"}
                        ifOverflow="visible"
                        isFront
                        stroke="#6CFF95"
                        segment={[
                            {
                                x: sortedSignificantUsdTvls[3],
                                y: 0,
                            },
                            {
                                x: sortedSignificantUsdTvls[3],
                                y: totalRewardsUsd,
                            },
                        ]}
                    />

                    <ReferenceDot
                        x={upperUsdTarget}
                        y={totalRewardsUsd}
                        r={4}
                        fill="#6CFF95"
                        stroke="white"
                        strokeWidth={1}
                        isFront
                    />

                    <ReferenceDot
                        x={0}
                        y={currentPayoutUsd}
                        r={3}
                        fill="#6CFF95"
                        stroke="none"
                        isFront
                    />

                    {currentPayoutUsd > 0 && (
                        <>
                            <ReferenceLine
                                strokeDasharray={"3 3"}
                                ifOverflow="visible"
                                isFront
                                stroke="#6CFF95"
                                segment={[
                                    { x: 0, y: currentPayoutUsd },
                                    { x: poolUsdTvl, y: currentPayoutUsd },
                                ]}
                            />
                            <ReferenceDot
                                x={poolUsdTvl}
                                y={currentPayoutUsd}
                                r={4}
                                fill="#6CFF95"
                                stroke="white"
                                strokeWidth={1}
                            />
                        </>
                    )}

                    <Tooltip
                        isAnimationActive={false}
                        content={
                            <TooltipContent
                                lowerUsdTarget={lowerUsdTarget}
                                upperUsdTarget={upperUsdTarget}
                                totalRewardsUsd={totalRewardsUsd}
                                minimumPayouPercentage={minimumPayoutPercentage}
                            />
                        }
                        cursor={
                            <TooltipCursor totalRewardsUsd={totalRewardsUsd} />
                        }
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
