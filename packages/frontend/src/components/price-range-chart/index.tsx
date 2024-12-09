import { Button, ErrorText, Typography } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { UsdPricedErc20Token } from "@metrom-xyz/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zoom } from "@/src/utils/price-range";
import { ZoomInIcon } from "@/src/assets/zoom-in-icon";
import { ZoomOutIcon } from "@/src/assets/zoom-out-icon";
import { TooltipContent } from "./tooltip";

import styles from "./styles.module.css";
import classNames from "classnames";

interface PriceRangeChartProps {
    error?: boolean;
    poolTick: number;
    activeTokenIndex: number;
    lowerUsdPrice?: number;
    upperUsdPrice?: number;
    className?: string;
}

// TODO: should we disable this for pools with more than 2 tokens?
export interface PriceChartData {
    tick: number;
    usdTvl: number;
    color: string;
    currentPrice: boolean;
    tokens: UsdPricedErc20Token[];
}

const ZOOM_FACTOR = 13;
const MAX_ZOOM_LEVEL = 4;
const MIN_ZOOM_LEVEL = 1;

export function PriceRangeChart({
    error,
    poolTick,
    activeTokenIndex,
    lowerUsdPrice,
    upperUsdPrice,
    className,
}: PriceRangeChartProps) {
    const t = useTranslations("priceRangeChart");
    const [poolTickIndex, setPoolTickIndex] = useState<number>(-1);
    const [activeChartData, setActiveChartData] = useState<PriceChartData[]>();
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [xAxisDomain, setXAxisDomain] = useState<number[]>();

    // TODO: remove mocked data
    const chartData: PriceChartData[] = useMemo(() => {
        return [];
    }, []);

    useEffect(() => {
        const index = chartData.findIndex((data) => data.tick === poolTick);
        setPoolTickIndex(index);
    }, [chartData, poolTick]);

    useEffect(() => {
        setActiveChartData(
            zoom(chartData, poolTickIndex, MIN_ZOOM_LEVEL, ZOOM_FACTOR),
        );
    }, [chartData, poolTickIndex]);

    useEffect(() => {
        if (activeTokenIndex === undefined || chartData.length === 0) return;

        const zoomedData = zoom(
            chartData,
            poolTickIndex,
            zoomLevel,
            ZOOM_FACTOR,
        );

        setXAxisDomain([
            zoomedData[0].tokens[activeTokenIndex].usdPrice,
            zoomedData[zoomedData.length - 1].tokens[activeTokenIndex].usdPrice,
        ]);

        setActiveChartData(chartData.slice());
    }, [activeTokenIndex, chartData, poolTickIndex, zoomLevel]);

    const handleZoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(prev - 1, MIN_ZOOM_LEVEL));
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(prev + 1, MAX_ZOOM_LEVEL));
    }, []);

    // TODO: empty error state?
    if (activeTokenIndex === undefined) {
        return null;
    }

    if (
        upperUsdPrice === undefined ||
        lowerUsdPrice === undefined ||
        chartData.length === 0
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
                <div className={styles.zoomButtons}>
                    <Button
                        variant="secondary"
                        size="xs"
                        icon={ZoomOutIcon}
                        disabled={zoomLevel === MIN_ZOOM_LEVEL}
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
                </div>
            </div>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart data={activeChartData} style={{ cursor: "pointer" }}>
                    <YAxis hide />
                    <XAxis
                        allowDataOverflow
                        type="number"
                        dataKey={(data: PriceChartData) =>
                            data.tokens[activeTokenIndex].usdPrice
                        }
                        height={20}
                        padding={{ left: 0, right: 0 }}
                        tickSize={4}
                        minTickGap={50}
                        domain={xAxisDomain}
                        axisLine={false}
                        tick={<Tick />}
                    />

                    <Bar
                        dataKey="usdTvl"
                        stackId="distribution"
                        data={activeChartData}
                        maxBarSize={50}
                        background={{ fill: "#F3F4F6" }}
                    >
                        {activeChartData?.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                cursor="pointer"
                                fill={entry.color}
                            />
                        ))}
                        <LabelList
                            dataKey="currentPrice"
                            content={
                                <CurrentPriceLabel zoomLevel={zoomLevel} />
                            }
                        />
                    </Bar>

                    <Tooltip
                        isAnimationActive={false}
                        cursor={{
                            fill: "#F3F4F6",
                            strokeWidth: 0,
                            opacity: 0.5,
                        }}
                        content={<TooltipContent />}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface CurrentPriceLabelProps {
    x?: number;
    y?: number;
    width?: number;
    index?: number;
    value?: boolean;
    zoomLevel: number;
}

function CurrentPriceLabel({
    x,
    y,
    width,
    value,
    index,
    zoomLevel,
    ...rest
}: CurrentPriceLabelProps) {
    const ref = useRef<SVGTextElement | null>(null);

    if (!x || !y || !width || !index || !value) return null;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                ref={ref}
                x={0}
                y={0}
                // TODO: find a better way center the label
                // dx={5 * zoomLevel}
                dy={-10}
                fontSize={12}
                // textAnchor="middle"
                className={styles.text}
            >
                Current price
            </text>
        </g>
    );
}

interface TickProps {
    payload?: {
        value: number;
    };
    x?: number;
    y?: number;
}

function Tick({ payload, x, y }: TickProps) {
    if (!payload?.value) return null;

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
                {payload.value}
            </text>
        </g>
    );
}
