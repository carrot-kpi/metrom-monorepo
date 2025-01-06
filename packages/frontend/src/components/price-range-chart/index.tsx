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
import { ZoomInIcon } from "@/src/assets/zoom-in-icon";
import { ZoomOutIcon } from "@/src/assets/zoom-out-icon";
import { TooltipContent } from "./tooltip";
import { useTicks } from "@/src/hooks/useTicks";
import type { Address } from "viem";
import classNames from "classnames";

import styles from "./styles.module.css";

interface PriceRangeChartProps {
    error?: boolean;
    poolAddress?: Address;
    // activeTokenIndex: number;
    lowerUsdPrice?: number;
    upperUsdPrice?: number;
    className?: string;
}

const ZOOM_FACTOR = 13;
const MAX_ZOOM_LEVEL = 4;
const MIN_ZOOM_LEVEL = 1;

export function PriceRangeChart({
    error,
    poolAddress,
    lowerUsdPrice,
    upperUsdPrice,
    className,
}: PriceRangeChartProps) {
    const t = useTranslations("priceRangeChart");
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [xAxisDomain, setXAxisDomain] = useState<number[]>();

    const { ticks, loading } = useTicks(poolAddress);

    if (
        upperUsdPrice === undefined ||
        lowerUsdPrice === undefined ||
        ticks.length === 0
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
            </div>
            <ResponsiveContainer
                width="100%"
                className={classNames("container", styles.container, className)}
            >
                <BarChart data={ticks} style={{ cursor: "pointer" }}>
                    <YAxis hide />
                    <XAxis hide />

                    <Bar
                        dataKey={(tick) => tick.liquidity.toString()}
                        maxBarSize={50}
                        background={{ fill: "#F3F4F6" }}
                    />

                    {/* <Tooltip
                        isAnimationActive={false}
                        cursor={{
                            fill: "#F3F4F6",
                            strokeWidth: 0,
                            opacity: 0.5,
                        }}
                        content={<TooltipContent />}
                    /> */}
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
