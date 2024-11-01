import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DistributionBreakdown } from "@/src/hooks/useDistributionBreakdown";
import { Typography } from "@metrom-xyz/ui";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { Address } from "viem";
import { useTransition, animated } from "@react-spring/web";
import { formatPercentage } from "@/src/utils/format";
import { shuffle } from "@/src/utils/common";
import type { PersonalRank } from "..";

import styles from "./styles.module.css";

interface RepartitionChartProps {
    loading: boolean;
    distributionBreakdown?: DistributionBreakdown;
    personalRank?: PersonalRank;
}

interface ChartData {
    name?: Address;
    position?: number;
    color?: string;
    value: number;
}

const CELLS_LIMIT = 5;
const CELLS_COLORS = shuffle([
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#facc15", // amber-400
    "#fbbf24", // yellow-400
    "#a3e635", // lime-400
    "#4ade80", // green-400
    "#34d399", // emerald-400
    "#2dd4bf", // teal-400
    "#22d3ee", // cyan-400
    "#38bdf8", // sky-400
    "#60a5fa", // blue-400
    "#818cf8", // indigo-400
    "#a78bfa", // violet-400
    "#c084fc", // purple-400
    "#e879f9", // fuchsia-400
    "#f472b6", // pink-400
    "#fb7185", // rose-400
]);

export function RepartitionChart({
    loading,
    distributionBreakdown,
    personalRank,
}: RepartitionChartProps) {
    const t = useTranslations("campaignDetails.leaderboard");

    const [activeIndex, setActiveIndex] = useState(0);

    const chartData = useMemo(() => {
        if (!distributionBreakdown) return undefined;

        const distributionBreakdownEntries = Object.entries(
            distributionBreakdown.sortedDistributionsByAccount,
        );

        const topRepartitions: ChartData[] = distributionBreakdownEntries
            .slice(0, CELLS_LIMIT)
            .map(([account, distribution], i) => ({
                name: account as Address,
                position: i + 1,
                value: distribution.percentage,
            }));

        const otherRepartitions = distributionBreakdownEntries
            .slice(CELLS_LIMIT + 1, distributionBreakdownEntries.length)
            .reduce(
                (accumulator, [_account, distribution]) =>
                    (accumulator += distribution.percentage),
                0,
            );

        if (personalRank && personalRank.position > CELLS_LIMIT)
            topRepartitions.push({
                name: personalRank.account,
                position: personalRank.position,
                value: personalRank.percentage,
            });

        const sorted = topRepartitions.sort((a, b) => b.value - a.value);

        if (otherRepartitions > 0)
            topRepartitions.push({
                value: otherRepartitions,
            });

        return sorted.map((rank, index) => ({
            ...rank,
            color: CELLS_COLORS[index],
        }));
    }, [distributionBreakdown, personalRank]);

    useEffect(() => {
        if (!chartData) return;

        if (personalRank) {
            const index = chartData.findIndex(
                (data) => data.name === personalRank.account,
            );
            setActiveIndex(index);
        }
    }, [chartData, personalRank]);

    return (
        <div className={styles.root}>
            <Typography uppercase weight="medium" light variant="sm">
                {t("repartition")}
            </Typography>
            <div className={styles.chartWrapper}>
                {!chartData || loading ? (
                    <div className={styles.chartWrapperLoading}></div>
                ) : (
                    <PieChart height={240} width={240}>
                        <Pie
                            dataKey="value"
                            animationEasing="ease-in-out"
                            animationDuration={500}
                            data={chartData}
                            activeIndex={activeIndex}
                            innerRadius={70}
                            outerRadius={120}
                            minAngle={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    strokeWidth={4}
                                    className={styles.cell}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            active
                            defaultIndex={activeIndex}
                            content={<RankTooltip />}
                        />
                    </PieChart>
                )}
            </div>
        </div>
    );
}

function RankTooltip({ active, payload }: any) {
    const t = useTranslations("campaignDetails.leaderboard");

    const transition = useTransition(active, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 200 },
    });

    if (!payload || !payload.length) return null;

    const color = payload[0].payload.color;

    return transition(
        (style, active) =>
            !!active && (
                <animated.div style={style} className={styles.tooltipWrapper}>
                    <Typography
                        weight="bold"
                        variant="xl"
                        style={{
                            color,
                        }}
                    >
                        {payload[0].payload.position
                            ? `#${payload[0].payload.position}`
                            : t("others")}
                    </Typography>
                    <Typography weight="bold" variant="xl2">
                        {formatPercentage(payload[0].value)}
                    </Typography>
                </animated.div>
            ),
    );
}
