import { StepNumberInput, type NumberFormatValues } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";

import styles from "./styles.module.css";
import { priceToTick, tickToPrice } from "@/src/utils/price-range";
import type { PoolWithTvl } from "@metrom-xyz/sdk";

interface RangeInputsProps {
    pool?: PoolWithTvl;
    error?: boolean;
    from?: number;
    onFromChange: (value: number | undefined) => void;
    to?: number;
    onToChange: (value: number | undefined) => void;
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
    onFromChange,
    onToChange,
}: RangeInputsProps) {
    const t = useTranslations("newCampaign.form.range");

    function handleFromOnChange(value: NumberFormatValues) {
        onFromChange(value.floatValue);
    }

    function handleFromBlur() {
        if (from === undefined) return;
        onFromChange(tickToPrice(priceToTick(from)));
    }

    function handleToOnChange(value: NumberFormatValues) {
        onToChange(value.floatValue);
    }

    function handleToBlur() {
        if (to === undefined) return;
        onToChange(tickToPrice(priceToTick(to)));
    }

    // TODO: handle pools with more than 2 tokens (such as stableswap3 pools)
    return (
        <div className={styles.root}>
            <StepNumberInput
                label={t("minPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                error={!!error}
                allowNegative={false}
                value={from?.toString()}
                onValueChange={handleFromOnChange}
                onBlur={handleFromBlur}
            />
            <StepNumberInput
                label={t("maxPrice", {
                    token0: pool?.tokens[0].symbol,
                    token1: pool?.tokens[1].symbol,
                })}
                placeholder="0.0"
                error={!!error}
                allowNegative={false}
                value={to?.toString()}
                onValueChange={handleToOnChange}
                onBlur={handleToBlur}
            />
        </div>
    );
}
