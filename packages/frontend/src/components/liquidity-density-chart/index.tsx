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
import { getPrice, type LiquidityDensity, type Pool } from "@metrom-xyz/sdk";
import { useMemo, useState } from "react";
import { TooltipContent } from "./tooltip";
import { formatUnits } from "viem";
import classNames from "classnames";
import { LiquidityBar } from "./liquidity-bar";

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

    const currentPrice = useMemo(() => {
        if (!liquidityDensity || !pool) return null;
        return getPrice(liquidityDensity.activeIdx, pool);
    }, [liquidityDensity, pool]);

    function handleOnMouseMove(state: CategoricalChartState) {
        if (state.isTooltipActive) setTooltipIndex(state.activeTooltipIndex);
        else setTooltipIndex(undefined);
    }

    function handleOnMouseLeave() {
        setTooltipIndex(undefined);
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
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart
                    data={chartData}
                    onMouseMove={handleOnMouseMove}
                    onMouseLeave={handleOnMouseLeave}
                    margin={{ top: 24 }}
                    style={{ cursor: "pointer" }}
                >
                    <YAxis hide domain={[0, "dataMax"]} />
                    <XAxis hide dataKey="price0" />

                    <Bar
                        dataKey="liquidity"
                        maxBarSize={50}
                        minPointSize={10}
                        shape={
                            <LiquidityBar
                                from={from}
                                to={to}
                                activeIdx={liquidityDensity.activeIdx}
                                chartData={chartData}
                                currentPrice={currentPrice}
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
