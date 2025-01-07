import { ErrorText, Typography } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { LiquidityDensity, Pool, Tick } from "@metrom-xyz/sdk";
import { useMemo } from "react";
import { TooltipContent } from "./tooltip";
import classNames from "classnames";

import styles from "./styles.module.css";

interface LiquidityDensityProps {
    error?: boolean;
    pool?: Pool;
    liquidityDensity?: LiquidityDensity;
    from?: number;
    to?: number;
    className?: string;
}

export type LiquidityDensityChartData = Tick;

export function LiquidityDensityChart({
    error,
    pool,
    liquidityDensity,
    from,
    to,
    className,
}: LiquidityDensityProps) {
    const t = useTranslations("liquidityDensityChart");

    const chartData: Tick[] = useMemo(() => {
        if (!liquidityDensity) return [];
        return liquidityDensity.ticks;
    }, [liquidityDensity]);

    if (!liquidityDensity || liquidityDensity.ticks.length === 0)
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
                            size="xs"
                            weight="medium"
                            className={styles.errorText}
                        >
                            {t("errors.missingData")}
                        </ErrorText>
                    ) : (
                        <Typography uppercase size="sm" light weight="medium">
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
                        size="xs"
                        weight="medium"
                        className={styles.errorText}
                    >
                        {t("errors.wrongData")}
                    </ErrorText>
                </div>
            </div>
        );
    }

    return (
        <div className={classNames("root", styles.root, className)}>
            <div className={styles.header}>
                <Typography weight="medium" light uppercase size="xs">
                    {t("title")}
                </Typography>
            </div>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart data={chartData} style={{ cursor: "pointer" }}>
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <XAxis hide dataKey="price0" />

                    <Bar
                        dataKey={(tick) => tick.liquidity.toString()}
                        stackId="distribution"
                        maxBarSize={50}
                        fillOpacity={1}
                        isAnimationActive={false}
                    >
                        {chartData?.map(({ idx }, index) => {
                            const tickInRange =
                                from !== undefined &&
                                to !== undefined &&
                                idx >= from &&
                                idx < to;

                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    cursor="pointer"
                                    fill={
                                        idx === liquidityDensity?.activeIdx
                                            ? "#6CFF95"
                                            : tickInRange
                                              ? "#6CFF9566"
                                              : "#E5E7EB"
                                    }
                                />
                            );
                        })}
                    </Bar>

                    <Tooltip
                        isAnimationActive={false}
                        cursor={{
                            fill: "#F3F4F6",
                            strokeWidth: 0,
                            opacity: 0.5,
                        }}
                        content={<TooltipContent pool={pool} />}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
