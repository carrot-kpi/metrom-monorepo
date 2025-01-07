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
import type { CategoricalChartState } from "recharts/types/chart/types";
import type { LiquidityDensity, Pool } from "@metrom-xyz/sdk";
import { useMemo, useState } from "react";
import { TooltipContent } from "./tooltip";
import { formatUnits } from "viem";
import classNames from "classnames";

import styles from "./styles.module.css";

interface LiquidityDensityProps {
    error?: boolean;
    loading?: boolean;
    pool?: Pool;
    liquidityDensity?: LiquidityDensity;
    from?: number;
    to?: number;
    className?: string;
}

export interface LiquidityDensityChartData {
    idx: number;
    liquidity: number;
    price0: number;
    price1: number;
}

export function LiquidityDensityChart({
    error,
    loading,
    pool,
    liquidityDensity,
    from,
    to,
    className,
}: LiquidityDensityProps) {
    const t = useTranslations("liquidityDensityChart");
    const [tooltipIndex, setTooltipIndex] = useState<number>();

    const chartData: LiquidityDensityChartData[] = useMemo(() => {
        if (!liquidityDensity || !pool) return [];
        return liquidityDensity.ticks.map((tick) => ({
            ...tick,
            liquidity: Number(formatUnits(tick.liquidity, 18)),
        }));
    }, [liquidityDensity, pool]);

    function handleOnMouseMove(state: CategoricalChartState) {
        if (state.isTooltipActive) setTooltipIndex(state.activeTooltipIndex);
        else setTooltipIndex(undefined);
    }

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
            <div className={styles.header}>
                <Typography weight="medium" light uppercase size="xs">
                    {t("title")}
                </Typography>
            </div>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart
                    data={chartData}
                    onMouseMove={handleOnMouseMove}
                    style={{ cursor: "pointer" }}
                >
                    <YAxis hide domain={[0, "auto"]} />
                    <XAxis hide dataKey="price0" />

                    <Bar
                        dataKey="liquidity"
                        maxBarSize={50}
                        minPointSize={10}
                        shape={
                            <CustomBar
                                from={from}
                                to={to}
                                activeIdx={liquidityDensity.activeIdx}
                                tooltipIndex={tooltipIndex}
                            />
                        }
                    >
                        {chartData?.map((_, index) => {
                            return (
                                <Cell key={`cell-${index}`} cursor="pointer" />
                            );
                        })}
                    </Bar>

                    <Tooltip
                        isAnimationActive={false}
                        cursor={false}
                        content={<TooltipContent pool={pool} />}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface ChartProps {
    index?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    from?: number;
    to?: number;
    idx?: number;
    activeIdx?: number;
    tooltipIndex?: number;
}

const CustomBar = ({
    index,
    x,
    y,
    width,
    height,
    from,
    to,
    idx,
    activeIdx,
    tooltipIndex,
}: ChartProps) => {
    if (
        !idx ||
        width === undefined ||
        height === undefined ||
        x === undefined ||
        y === undefined
    )
        return null;

    const inRange = !!from && !!to && idx >= from && idx < to;
    const fill =
        idx === activeIdx ? "#6CFF95" : inRange ? "#6CFF9566" : "#E5E7EB";

    let opacity = 1;
    if (tooltipIndex === index) opacity = 0.65;

    return (
        <g>
            <rect
                x={x}
                y={y}
                fill={fill}
                fillOpacity={opacity}
                width={width}
                height={height}
                rx={4}
            />
        </g>
    );
};
