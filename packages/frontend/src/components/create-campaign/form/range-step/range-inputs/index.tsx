import { StepNumberInput } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import {
    type PoolWithTvl,
    tickToPrice,
    priceToTick,
    getTick,
} from "@metrom-xyz/sdk";
import { useCallback } from "react";

import styles from "./styles.module.css";

export interface RangeBound {
    price: number;
    tick: number;
}

interface RangeInputsProps {
    pool?: PoolWithTvl;
    error?: boolean;
    currentPrice?: number;
    from?: number;
    to?: number;
    priceStep?: number;
    onFromChange: (value: RangeBound | undefined) => void;
    onToChange: (value: RangeBound | undefined) => void;
}

export function RangeInputs({
    pool,
    error,
    currentPrice,
    from,
    to,
    priceStep,
    onFromChange,
    onToChange,
}: RangeInputsProps) {
    const t = useTranslations("newCampaign.form.range");

    const handleFromOnChange = useCallback(
        (value: number | undefined) => {
            if (value === undefined || !pool) {
                onFromChange(undefined);
                return;
            }

            onFromChange({
                price: value,
                tick: getTick(value, pool),
            });
        },
        [pool, onFromChange],
    );

    const handleToOnChange = useCallback(
        (value: number | undefined) => {
            if (value === undefined || !pool) {
                onToChange(undefined);
                return;
            }

            onToChange({
                price: value,
                tick: getTick(value, pool),
            });
        },
        [pool, onToChange],
    );

    const getFromStepHandler = useCallback(
        (type: "increment" | "decrement") => {
            return () => {
                if (!priceStep || !currentPrice) return;
                const delta = type === "increment" ? priceStep : -priceStep;
                const base = from || currentPrice;
                handleFromOnChange(base + delta);
            };
        },
        [currentPrice, from, priceStep, handleFromOnChange],
    );

    const getToStepHandler = useCallback(
        (type: "increment" | "decrement") => {
            return () => {
                if (!priceStep || !currentPrice) return;
                const delta = type === "increment" ? priceStep : -priceStep;
                const base = to || currentPrice;
                handleToOnChange(base + delta);
            };
        },
        [currentPrice, to, priceStep, handleToOnChange],
    );

    const handleFromOnBlur = useCallback(() => {
        if (!pool || from === undefined) return;

        const price = tickToPrice(priceToTick(from));
        onFromChange({
            price,
            tick: getTick(price, pool),
        });
    }, [from, pool, onFromChange]);

    const handleToOnBlur = useCallback(() => {
        if (!pool || to === undefined) return;

        const price = tickToPrice(priceToTick(to));
        onToChange({
            price,
            tick: getTick(price, pool),
        });
    }, [to, pool, onToChange]);

    // TODO: handle pools with more than 2 tokens (such as stableswap3 pools)
    return (
        <div className={styles.root}>
            <StepNumberInput
                label={t("minPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                step={priceStep}
                error={!!error}
                allowNegative={false}
                value={from}
                onChange={handleFromOnChange}
                onDecrement={getFromStepHandler("decrement")}
                onIncrement={getFromStepHandler("increment")}
                onBlur={handleFromOnBlur}
            />
            <StepNumberInput
                label={t("maxPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                step={priceStep}
                error={!!error}
                allowNegative={false}
                value={to}
                onChange={handleToOnChange}
                onDecrement={getToStepHandler("decrement")}
                onIncrement={getToStepHandler("increment")}
                onBlur={handleToOnBlur}
            />
        </div>
    );
}
