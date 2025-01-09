import { NumberInput, type NumberFormatValues } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import {
    type PoolWithTvl,
    tickToPrice,
    priceToTick,
    getTick,
} from "@metrom-xyz/sdk";
import { useState } from "react";

import styles from "./styles.module.css";

export interface RangeBound {
    price: number;
    tick: number;
}

interface RangeInputsProps {
    pool?: PoolWithTvl;
    error?: boolean;
    priceFrom?: number;
    priceTo?: number;
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
    priceFrom,
    priceTo,
    onFromChange,
    onToChange,
}: RangeInputsProps) {
    const t = useTranslations("newCampaign.form.range");
    const [fromRaw, setFromRaw] = useState<number | undefined>(priceFrom);
    const [toRaw, setToRaw] = useState<number | undefined>(priceTo);

    function handleFromOnChange(value: NumberFormatValues) {
        setFromRaw(value.floatValue);
    }

    function handleToOnChange(value: NumberFormatValues) {
        setToRaw(value.floatValue);
    }

    function handleFromBlur() {
        if (fromRaw === undefined) {
            onFromChange(undefined);
            return;
        }

        if (!pool) return;

        const price = tickToPrice(priceToTick(fromRaw));
        onFromChange({
            price,
            tick: getTick(price, pool),
        });
    }

    function handleToBlur() {
        if (toRaw === undefined) {
            onToChange(undefined);
            return;
        }

        if (!pool) return;

        const price = tickToPrice(priceToTick(toRaw));
        onToChange({
            price,
            tick: getTick(price, pool),
        });
    }

    // TODO: handle pools with more than 2 tokens (such as stableswap3 pools)
    return (
        <div className={styles.root}>
            <NumberInput
                label={t("minPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                error={!!error}
                allowNegative={false}
                value={priceFrom?.toFixed(4)}
                onValueChange={handleFromOnChange}
                onBlur={handleFromBlur}
            />
            <NumberInput
                label={t("maxPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                error={!!error}
                allowNegative={false}
                value={priceTo?.toFixed(4)}
                onValueChange={handleToOnChange}
                onBlur={handleToBlur}
            />
        </div>
    );
}
