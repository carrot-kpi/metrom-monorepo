import { Button, ErrorText, Typography } from "@metrom-xyz/ui";
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
import { useCallback, useMemo, useRef, useState } from "react";
import { ZoomInIcon } from "@/src/assets/zoom-in-icon";
import { ZoomOutIcon } from "@/src/assets/zoom-out-icon";
import { TooltipContent } from "./tooltip";
import classNames from "classnames";
import { zoom } from "@/src/utils/liquidity-density";

import styles from "./styles.module.css";
import { formatAmount } from "@/src/utils/format";

interface LiquidityDensityProps {
    error?: boolean;
    pool?: Pool;
    liquidityDensity?: LiquidityDensity;
    from?: number;
    to?: number;
    className?: string;
}

export type LiquidityDensityChartData = Tick;

const ZOOM_FACTOR = 180;
const MAX_ZOOM_LEVEL = 8;
const MIN_ZOOM_LEVEL = 1;

export function LiquidityDensityChart({
    error,
    pool,
    liquidityDensity,
    from,
    to,
    className,
}: LiquidityDensityProps) {
    const t = useTranslations("liquidityDensityChart");
    const [zoomLevel, setZoomLevel] = useState<number>(MAX_ZOOM_LEVEL / 2);

    const chartData: Tick[] = useMemo(() => {
        if (!liquidityDensity) return [];
        return liquidityDensity.ticks;
    }, [liquidityDensity]);

    const activeTickIndex = useMemo(() => {
        if (!liquidityDensity) return -1;
        return chartData.findIndex(
            (data) => data.idx === liquidityDensity.activeIdx,
        );
    }, [chartData, liquidityDensity]);

    const activeChartData = useMemo(() => {
        return zoom(chartData, activeTickIndex, zoomLevel, ZOOM_FACTOR);
    }, [chartData, activeTickIndex, zoomLevel]);

    const handleZoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(prev - 1, MIN_ZOOM_LEVEL));
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(prev + 1, MAX_ZOOM_LEVEL));
    }, []);

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
                {/* FIXME: do we need the zoom, since we're aggregating the ticks we have just a few bars */}
                {/* <div className={styles.zoomButtons}>
                    <Button
                        variant="secondary"
                        size="xs"
                        icon={ZoomOutIcon}
                        disabled={
                            zoomLevel === MIN_ZOOM_LEVEL ||
                            activeChartData.length === chartData.length
                        }
                        onClick={handleZoomOut}
                        className={{ root: styles.zoomButton }}
                    />
                    <div className={styles.divider}></div>
                    <Button
                        variant="secondary"
                        size="xs"
                        icon={ZoomInIcon}
                        disabled={zoomLevel === MAX_ZOOM_LEVEL}
                        onClick={handleZoomIn}
                        className={{ root: styles.zoomButton }}
                    />
                </div> */}
            </div>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart data={activeChartData} style={{ cursor: "pointer" }}>
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <XAxis hide dataKey="price0" />

                    <Bar
                        dataKey={(tick) => tick.liquidity.toString()}
                        stackId="distribution"
                        maxBarSize={50}
                        fillOpacity={1}
                        isAnimationActive={false}
                    >
                        {activeChartData?.map(({ idx }, index) => {
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

interface TickProps {
    payload?: {
        value: number;
    };
    index?: number;
    x?: number;
    y?: number;
}

function Tick({ payload, index, x, y }: TickProps) {
    if (!payload?.value || (index && index % 2 === 0)) return null;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={12}
                fontSize={12}
                textAnchor="middle"
                className={styles.text}
            >
                {formatAmount({ amount: payload.value })}
            </text>
        </g>
    );
}
