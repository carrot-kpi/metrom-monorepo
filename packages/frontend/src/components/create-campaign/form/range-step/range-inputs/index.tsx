import type { CampaignPayload } from "@/src/types";
import {
    Button,
    StepNumberInput,
    type NumberFormatValues,
} from "@metrom-xyz/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "react-use";

import styles from "./styles.module.css";

interface RangeInputsProps {
    tickPriceSpacing: number;
    error?: boolean;
    rangeSpecification?: CampaignPayload["rangeSpecification"];
    onTokenPriceFlip: () => void;
    onLowerUsdTargetChange: (value: number | undefined) => void;
    onUpperUsdTargetChange: (value: number | undefined) => void;
}

export interface NumberInputValues {
    raw?: NumberFormatValues["floatValue"];
    formatted?: NumberFormatValues["formattedValue"];
}

export function RangeInputs({
    tickPriceSpacing,
    error,
    rangeSpecification,
    onTokenPriceFlip,
    onLowerUsdTargetChange,
    onUpperUsdTargetChange,
}: RangeInputsProps) {
    const t = useTranslations("newCampaign.form.range");

    const [lowerUsdTargetRaw, setLowerUsdTargetRaw] = useState<
        NumberInputValues | undefined
    >(() => {
        if (rangeSpecification) {
            return {
                raw: rangeSpecification.lowerUsdTarget,
                formatted: rangeSpecification.lowerUsdTarget.toString(),
            };
        }
        return undefined;
    });
    const [upperUsdTargetRaw, setUpperUsdTargetRaw] = useState<
        NumberInputValues | undefined
    >(() => {
        if (rangeSpecification) {
            return {
                raw: rangeSpecification.upperUsdTarget,
                formatted: rangeSpecification.upperUsdTarget.toString(),
            };
        }
        return undefined;
    });

    useDebounce(
        () => {
            onLowerUsdTargetChange(lowerUsdTargetRaw?.raw);
        },
        200,
        [lowerUsdTargetRaw],
    );

    useDebounce(
        () => {
            onUpperUsdTargetChange(upperUsdTargetRaw?.raw);
        },
        200,
        [upperUsdTargetRaw],
    );

    function handleLowerUsdTargetOnChange(value: NumberFormatValues) {
        setLowerUsdTargetRaw({
            raw: value.floatValue,
            formatted: value.formattedValue,
        });
    }

    function handleUpperUsdTargetOnChange(value: NumberFormatValues) {
        setUpperUsdTargetRaw({
            raw: value.floatValue,
            formatted: value.formattedValue,
        });
    }

    function handleTokenPriceOnFlip() {
        onTokenPriceFlip();
        setUpperUsdTargetRaw({ raw: undefined, formatted: "" });
        setLowerUsdTargetRaw({ raw: undefined, formatted: "" });
    }

    return (
        <div className={styles.root}>
            <Button
                variant="secondary"
                size="xs"
                onClick={handleTokenPriceOnFlip}
            >
                invert
            </Button>
            <StepNumberInput
                label={t("minPrice")}
                placeholder="$0"
                prefix="$"
                step={tickPriceSpacing}
                forceStep
                error={!!error}
                allowNegative={false}
                value={lowerUsdTargetRaw?.formatted}
                onValueChange={handleLowerUsdTargetOnChange}
            />
            <StepNumberInput
                label={t("maxPrice")}
                placeholder="$0"
                prefix="$"
                step={tickPriceSpacing}
                forceStep
                error={!!error}
                allowNegative={false}
                value={upperUsdTargetRaw?.formatted}
                onValueChange={handleUpperUsdTargetOnChange}
            />
        </div>
    );
}
