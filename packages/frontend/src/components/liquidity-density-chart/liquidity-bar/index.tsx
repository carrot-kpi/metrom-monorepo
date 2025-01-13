import type { LiquidityDensityChartData } from "..";

import styles from "./styles.module.css";

interface LiquidityBarProps {
    index?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    price0?: number;
    price1?: number;
    from?: number;
    to?: number;
    chartData: LiquidityDensityChartData[];
    idx?: number;
    activeIdx?: number;
    currentPrice: number | null;
    tooltipIndex?: number;
}

export function LiquidityBar({
    index,
    x,
    y,
    width,
    height,
    price0,
    price1,
    from,
    to,
    chartData,
    idx,
    activeIdx,
    currentPrice,
    tooltipIndex,
}: LiquidityBarProps) {
    if (
        !idx ||
        index === undefined ||
        width === undefined ||
        height === undefined ||
        price0 === undefined ||
        price1 === undefined ||
        x === undefined ||
        y === undefined
    )
        return null;

    const inRange =
        from !== undefined && to !== undefined && idx >= from && idx < to;
    const fill =
        idx === activeIdx ? "#6CFF95" : inRange ? "#6CFF9566" : "#E5E7EB";

    let percentage = 0;
    if (
        from !== undefined &&
        to !== undefined &&
        activeIdx !== undefined &&
        currentPrice
    ) {
        const chartDataInRange = chartData.filter(
            (data) => data.idx >= from && data.idx < to,
        );
        const closestFrom = chartDataInRange.reduce(
            (closest: number, current) =>
                Math.abs(current.idx - from) < Math.abs(closest - from)
                    ? current.idx
                    : closest,
            0,
        );
        const closestTo = chartDataInRange.reduce(
            (closest: number, current) =>
                Math.abs(current.idx - to) < Math.abs(closest - to)
                    ? current.idx
                    : closest,
            0,
        );

        if (closestFrom === idx || closestTo === idx) {
            percentage =
                (idx < activeIdx ? -1 : 1) *
                (Math.abs(price0 - currentPrice) / currentPrice) *
                100;
        }
    }

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
            {percentage && (
                <text
                    x={percentage > 0 ? x : x + 15}
                    y={y - 8}
                    fontSize={12}
                    textAnchor={percentage > 0 ? "start" : "end"}
                    className={styles.label}
                >
                    {`${percentage.toFixed(2)}%`}
                </text>
            )}
        </g>
    );
}
