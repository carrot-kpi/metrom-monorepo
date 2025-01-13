import { StepNumberInput, type NumberFormatValues } from "@metrom-xyz/ui";
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
    from?: number;
    to?: number;
    priceStep?: number;
    onFromChange: (value: RangeBound | undefined) => void;
    onToChange: (value: RangeBound | undefined) => void;
}

export interface NumberInputValues {
    raw?: NumberFormatValues["floatValue"];
    formatted?: NumberFormatValues["formattedValue"];
}

export function RangeInputs({
    pool,
    error,
    from,
    to,
    priceStep,
    onFromChange,
    onToChange,
}: RangeInputsProps) {
    const t = useTranslations("newCampaign.form.range");

    const handleFromOnChange = useCallback(
        (value: NumberFormatValues) => {
            if (value.floatValue === undefined || !pool) {
                onFromChange(undefined);
                return;
            }

            onFromChange({
                price: value.floatValue,
                tick: getTick(value.floatValue, pool),
            });
        },
        [pool, onFromChange],
    );

    const handleToOnChange = useCallback(
        (value: NumberFormatValues) => {
            if (value.floatValue === undefined || !pool) {
                onToChange(undefined);
                return;
            }

            onToChange({
                price: value.floatValue,
                tick: getTick(value.floatValue, pool),
            });
        },
        [pool, onToChange],
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
                value={from?.toString()}
                onValueChange={handleFromOnChange}
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
                value={to?.toString()}
                onValueChange={handleToOnChange}
                onBlur={handleToOnBlur}
            />
        </div>
    );
}
